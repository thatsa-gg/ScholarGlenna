import { formatDuration, roundWeek } from '@glenna/util'
import { Temporal, toTemporalInstant } from '@js-temporal/polyfill'
import { Prisma, type TeamTime, type Team } from '../../generated/client/index.js'

function calculationTimeZone(team: Pick<Team, 'primaryTimeZone' | 'daylightSavings'>){
    if(team.daylightSavings === 'RespectReset')
        return 'UTC'
    return team.primaryTimeZone
}

function transformTeamTime(data: {
    now?: Temporal.ZonedDateTime,
    timeZone: Temporal.TimeZoneLike,
    currentWeek?: Temporal.ZonedDateTime,
    time: Pick<TeamTime, 'index' | 'duration' | 'time'>
}){
    const now = data.now ?? Temporal.Now.zonedDateTimeISO(data.timeZone)
    const current = data.currentWeek ?? roundWeek(now)
    const time = toTemporalInstant.apply(data.time.time).toZonedDateTimeISO(data.timeZone)
    const offset = time.since(roundWeek(time))
    let next = current.add(offset) // TODO: will this be an hour off if it crosses the DST transition
    if(Temporal.ZonedDateTime.compare(next, now) < 0)
        next = next.add({ days: 7 })
    const duration = Temporal.Duration.from({ minutes: data.time.duration }).round({ largestUnit: 'hours' })
    return {
        index: data.time.index,
        time: next,
        duration,
        timeCode(style: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'r' = 'f'){
            return `<t:${next.epochSeconds}:${style}>`
        },
        toString(format: 'embed' | 'plain' = 'embed'){
            const time = format === 'embed' ? `<t:${next.epochSeconds}>` : next.withTimeZone('UTC').toString({ smallestUnit: 'minute' })
            return `${time} for ${formatDuration(duration)}`
        }
    }
}

function nextRunTimes(team: Pick<Team, 'primaryTimeZone' | 'daylightSavings'>, times: Pick<TeamTime, 'index' | 'time' | 'duration'>[]){
    // if the calculations are done in the primary time zone, then the time-of-day will remain the same during DST transitions
    // if they're done in UTC, then the reset offset will remain the same
    const timeZone = calculationTimeZone(team)
    const now = Temporal.Now.zonedDateTimeISO(timeZone)
    const currentWeek = now.round({ smallestUnit: 'day', roundingMode: 'floor' }).subtract({ days: now.dayOfWeek })
    return times.map(time => transformTeamTime({ now, currentWeek, timeZone, time }))
                .sort((a, b) => Temporal.ZonedDateTime.compare(a.time, b.time))
}

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
                compute: team => async () => nextRunTimes(team, await client.teamTime.findMany({
                    where: { team: { id: team.id }},
                    select: {
                        index: true,
                        time: true,
                        duration: true
                    }
                }))
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
        teamTime: {
            nextRun: {
                needs: { index: true, time: true, duration: true, teamId: true },
                compute: time => {
                    function compute(): Promise<ReturnType<typeof transformTeamTime>>
                    function compute(team: Pick<Team, 'primaryTimeZone' | 'daylightSavings'>): ReturnType<typeof transformTeamTime>
                    function compute(team?: Pick<Team, 'primaryTimeZone' | 'daylightSavings'>): ReturnType<typeof transformTeamTime> | Promise<ReturnType<typeof transformTeamTime>>{
                        if(!team)
                            return client.team.findUniqueOrThrow({
                                where: { id: time.teamId },
                                select: {
                                    primaryTimeZone: true,
                                    daylightSavings: true
                                }
                            }).then(team => transformTeamTime({ time, timeZone: calculationTimeZone(team) }))
                        return transformTeamTime({ time, timeZone: calculationTimeZone(team) })
                    }
                    return compute
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
        },
        teamTime: {
            async autocomplete(guildId: bigint, teamAlias: string | null){
                if(!teamAlias)
                    return
                const team = await client.team.findFirst({
                    where: {
                        alias: teamAlias,
                        guild: { snowflake: guildId }
                    },
                    select: {
                        primaryTimeZone: true,
                        daylightSavings: true,
                        times: {
                            select: {
                                index: true,
                                duration: true,
                                time: true
                            }
                        }
                    }
                })
                if(!team)
                    return
                return nextRunTimes(team, team.times).map(time => ({
                    name: `(${time.index}) ${time.toString('plain')}`,
                    value: time.index
                }))
            }
        }
    }
}))
