import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { Temporal } from '@js-temporal/polyfill'

import { Days } from './__common.js'

function currentTimeOfDay(){
    const now = Temporal.Now.zonedDateTimeISO('UTC')
    const today = now.round({ smallestUnit: 'day', roundingMode: 'floor' })
    return now.since(today)
}

export const add = subcommand({
    description: `Add a team time (UTC).`,
    input: {
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        team: djs.team().describe('The team to add times for.'),
        day: djs.nativeEnum(Days).describe('Day-of-week (in the team\'s time zone).'),
        reset: djs.number(-24, 24).describe('Offset relative to daily reset (0:00 UTC).'),
        duration: djs.number(15, 1440).nullable().transform(a => a ?? 120).describe('The duration in minutes.')
    },
    authorization: {
        key: 'team', team: 'createTime'
    },
    async execute({ guild, team: snowflake, duration, day, reset }){
        const team = await database.team.findUniqueOrThrow({
            where: { snowflake, guild },
            select: {
                id: true,
                primaryTimeZone: true,
                daylightSavings: true,
                mention: true,
                _count: {
                    select: {
                        times: true
                    }
                }
            }
        })

        const localNow = Temporal.Now.zonedDateTimeISO(team.primaryTimeZone)
        const localDay = localNow.round({ smallestUnit: 'day', roundingMode: 'floor' })
        const localTimeDay = localDay.subtract({ days: localDay.dayOfWeek }).add({ days: day })

        const utcTimeDay = localTimeDay.withTimeZone('UTC').round({ smallestUnit: 'day', roundingMode: 'floor' })
        const utcDay = Temporal.ZonedDateTime.compare(utcTimeDay, localTimeDay) < 0
            ? utcTimeDay.add({ days: 1 })
            : utcTimeDay

        const utcTime = utcDay.add(reset ? Temporal.Duration.from({ minutes: (reset * 60)|0 }) : currentTimeOfDay())
        const time = await database.teamTime.create({
            data: {
                team: { connect: { id: team.id }},
                index: team._count.times + 1,
                duration,
                time: new Date(utcTime.epochMilliseconds)
            },
            select: {
                index: true,
                nextRun: true
            }
        })
        return `Time ${time.index} added to team ${team.mention}! New time: ${time.nextRun(team)}`
    }
})
