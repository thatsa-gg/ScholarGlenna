import { roundWeek, timestampToFriendlyString } from '@glenna/util'
import { Temporal, toTemporalInstant } from '@js-temporal/polyfill'
import { Prisma, type TeamTime, type Team } from '../../generated/client/index.js'
import type { TeamPermissions } from './authorization.js'
import type { APIGuild, APIUser } from 'discord-api-types/v10'

type MaybePromise<T> = T | Promise<T>

function calculationTimeZone(team: Pick<Team, 'primaryTimeZone' | 'daylightSavings'>){
    if(team.daylightSavings === 'RespectReset')
        return 'UTC'
    return team.primaryTimeZone
}

function transformTeamTime(data: {
    now?: Temporal.ZonedDateTime,
    calculationTZ: Temporal.TimeZoneLike,
    presentationTZ: Temporal.TimeZoneLike,
    currentWeek?: Temporal.ZonedDateTime,
    time: Pick<TeamTime, 'index' | 'duration' | 'time'>
}){
    const now = data.now ?? Temporal.Now.zonedDateTimeISO(data.calculationTZ)
    const current = data.currentWeek ?? roundWeek(now)
    const time = toTemporalInstant.apply(data.time.time).toZonedDateTimeISO(data.calculationTZ)
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
        toString(){
            return timestampToFriendlyString(next.withTimeZone(data.presentationTZ))
        }
    }
}

function nextRunTimes(team: Pick<Team, 'primaryTimeZone' | 'daylightSavings'>, times: Pick<TeamTime, 'index' | 'time' | 'duration'>[]){
    // if the calculations are done in the primary time zone, then the time-of-day will remain the same during DST transitions
    // if they're done in UTC, then the reset offset will remain the same
    const timeZone = calculationTimeZone(team)
    const now = Temporal.Now.zonedDateTimeISO(timeZone)
    const currentWeek = now.round({ smallestUnit: 'day', roundingMode: 'floor' }).subtract({ days: now.dayOfWeek })
    return times.map(time => transformTeamTime({ now, currentWeek, calculationTZ: timeZone, presentationTZ: team.primaryTimeZone, time }))
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
                            }).then(team => transformTeamTime({ time, calculationTZ: calculationTimeZone(team), presentationTZ: team.primaryTimeZone }))
                        return transformTeamTime({ time, calculationTZ: calculationTimeZone(team), presentationTZ: team.primaryTimeZone })
                    }
                    return compute
                }
            }
        }
    },
    model: {
        team: {
            async autocompleteSnowflake(guild: Pick<APIGuild, 'id'>, user: Pick<APIUser, 'id'>, searchValue: string, permissions: TeamPermissions[]){
                const snowflake = BigInt(user.id)
                const teams = await client.team.findMany({
                    where: {
                        guild: { snowflake: BigInt(guild.id) },
                        OR: [
                            { name: { startsWith: searchValue, mode: 'insensitive' }},
                            { alias: { startsWith: searchValue, mode: 'insensitive' }}
                        ],
                        permission: {
                            AND: Object.assign({}, ...permissions.map(p => ({
                                [p]: { permissions: { some: { user: { snowflake }}}}
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
            async autocompleteId(guild: Pick<APIGuild, 'id'>, user: Pick<APIUser, 'id'>, teamSnowflake: bigint | null, searchValue: string, permissions: TeamPermissions[]){
                if(!teamSnowflake)
                    return
                const snowflake = BigInt(user.id)
                const team = await client.team.findUnique({
                    where: {
                        snowflake: teamSnowflake,
                        guild: { snowflake: BigInt(guild.id) },
                        permission: {
                            AND: Object.assign({}, ...permissions.map(p => ({
                                [p]: { permissions: { some: { user: { snowflake }}}}
                            })))
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
                            },
                            orderBy: { index: 'asc' }
                        }
                    }
                })
                if(!team)
                    return []
                return nextRunTimes(team, team.times).map(time => ({
                    name: `(${time.index}) ${timestampToFriendlyString(time.time.withTimeZone(team.primaryTimeZone))}`,
                    value: time.index
                })).filter(t => t.name.includes(searchValue)).slice(0, 25)
            }
        }
    }
}))
