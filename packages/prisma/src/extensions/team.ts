import { Temporal, toTemporalInstant } from '@js-temporal/polyfill'
import { Prisma, type Team, type TeamMemberRole, type GuildMember } from '../../generated/client/index.js'

export const teamExtension = Prisma.defineExtension((client) => client.$extends({
    result: {
        team: {
            mention: {
                needs: { name: true, role: true },
                compute({ name, role }){
                    if(role)
                        return `<@&${role}>`
                    return name
                }
            },
            nextRunTimes: {
                needs: { id: true, primaryTimeZone: true, daylightSavings: true },
                compute: team => async () => {
                    const times = await client.teamTime.findMany({
                        where: { team: { id: team.id }},
                        select: {
                            index: true,
                            time: true,
                            duration: true
                        }
                    })

                    // if the calculations are done in the primary time zone, then the time-of-day will remain the same during DST transitions
                    // if they're done in UTC, then the reset offset will remain the same
                    const timeZone = team.daylightSavings === 'RespectTime' ? team.primaryTimeZone : 'UTC'
                    const now = Temporal.Now.zonedDateTimeISO(timeZone)
                    const currentWeek = now.round({ smallestUnit: 'day', roundingMode: 'floor' }).subtract({ days: now.dayOfWeek })
                    return times.map(time => {
                        const realTime = toTemporalInstant.apply(time.time).toZonedDateTimeISO(timeZone)
                        const week = realTime.round({ smallestUnit: 'day', roundingMode: 'floor' }).subtract({ days: realTime.dayOfWeek })
                        const weekOffset = realTime.since(week)
                        let nextRun = currentWeek.add(weekOffset)
                        if(Temporal.ZonedDateTime.compare(nextRun, now) < 0){
                            nextRun = nextRun.add({ days: 7 })
                        }
                        return {
                            index: time.index,
                            time: nextRun,
                            duration: Temporal.Duration.from({ minutes: time.duration }).round({ largestUnit: 'hours' }),
                            timeCode(style: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'r' = 'f'){
                                return `<t:${nextRun.epochSeconds}:${style}>`
                            }
                        }
                    }).sort((a, b) => Temporal.ZonedDateTime.compare(a.time, b.time))
                }
            },
            nextDaylightSavingsShift: {
                needs: { primaryTimeZone: true, daylightSavings: true },
                compute({ primaryTimeZone, daylightSavings }){
                    if(daylightSavings === 'RespectReset')
                        return null
                    const next = Temporal.TimeZone.from(primaryTimeZone).getNextTransition?.(Temporal.Now.instant()) ?? null
                    if(next === null)
                        return null
                    return {
                        time: next.toZonedDateTimeISO(primaryTimeZone),
                        timeCode(style: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'r' = 'f'){
                            return `<t:${next.epochSeconds}:${style}>`
                        }
                    }
                }
            }
        },
        teamTimeComputed: {
            timeCode: {
                needs: { epoch: true },
                compute({ epoch }){
                    return (style: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'r' = 'f') => `<t:${epoch}:${style}>`
                }
            }
        }
    },
    model: {
        team: {
            async autocomplete(guildSnowflake: bigint, searchValue: string){
                const teams = await client.team.findMany({
                    where: {
                        guild: { snowflake: guildSnowflake },
                        OR: [
                            { name: { startsWith: searchValue }},
                            { alias: { startsWith: searchValue }}
                        ]
                    },
                    select: {
                        name: true,
                        alias: true
                    }
                })
                return teams.map(({ name, alias }) => ({ name, value: alias }))
            }
        },
        timeZone: {
            async autocomplete(searchValue: string){
                const matches = await client.timeZone.findMany({
                    where: {
                        OR: [
                            { name: { startsWith: searchValue, mode: 'insensitive' }},
                            { abbreviation: { startsWith: searchValue, mode: 'insensitive' }}
                        ]
                    },
                    select: {
                        name: true,
                        display: true
                    }
                })
                return matches.map(({ display, name }) => ({ name: display, value: name }))
            }
        }
    }
}))
