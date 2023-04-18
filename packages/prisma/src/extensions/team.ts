import { formatDuration, roundWeek } from '@glenna/util'
import { Temporal, toTemporalInstant } from '@js-temporal/polyfill'
import { Prisma, type TeamTime, type Team, type TeamType } from '../../generated/client/index.js'
import type { AutocompleteInteraction } from '@glenna/discord'
import type { TeamPermissions } from './authorization.js'

type MaybePromise<T> = T | Promise<T>

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
                    type _team = Pick<Team, 'primaryTimeZone' | 'daylightSavings'>
                    type _time = ReturnType<typeof transformTeamTime>
                    function compute(): Promise<_time>
                    function compute(team: _team): _time
                    function compute(team?: _team): MaybePromise<_time> {
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
            async autocompleteSnowflake(interaction: AutocompleteInteraction, searchValue: string, permissions: TeamPermissions[]){
                const snowflake = BigInt(interaction.user.id)
                const teams = await client.team.findMany({
                    where: {
                        guild: { snowflake: BigInt(interaction.guild!.id) },
                        OR: [
                            { name: { startsWith: searchValue }},
                            { alias: { startsWith: searchValue }}
                        ],
                        permission: {
                            AND: Object.assign({}, ...permissions.map(p => ({
                                [p]: { members: { some: { user: { snowflake }}}}
                            })))
                        }
                    },
                    take: 25,
                    select: {
                        name: true,
                        snowflake: true
                    }
                })
                return teams.map(({ name, snowflake }) => ({ name, value: snowflake.toString() }))
            }
        },
        teamTime: {
            async autocompleteId(interaction: AutocompleteInteraction, teamSnowflake: bigint | null, searchValue: string){
                if(!teamSnowflake)
                    return
                const snowflake = BigInt(interaction.user.id)
                const team = await client.team.findUnique({
                    where: {
                        snowflake: teamSnowflake,
                        guild: { snowflake: BigInt(interaction.guild!.id) },
                        permission: {
                            readTime: { members: { some: { user: { snowflake }}}}
                        }
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
                    return []
                return nextRunTimes(team, team.times).map(time => ({
                    name: `(${time.index}) ${time.toString('plain')}`,
                    value: time.index
                })).filter(t => t.name.includes(searchValue)).slice(0, 25)
            }
        }
    }
}))
