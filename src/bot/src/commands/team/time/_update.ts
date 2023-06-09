import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { Temporal, toTemporalInstant } from '@js-temporal/polyfill'

import { Days, AutocompleteTime } from './__common.js'

export const update = subcommand({
    description: `Alter a team time (UTC).`,
    input: {
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        actor: djs.actor(),
        team: djs.team().describe('The team to update times for.'),
        time: djs.autocomplete(djs.integer(), { autocomplete: AutocompleteTime }).describe('The time to update.'),
        duration: djs.number(15, 1440).nullable().describe('The new duration in minutes.'),
        day: djs.nativeEnum(Days).nullable().describe('Day-of-week (in UTC).'),
        reset: djs.number(-24, 24).nullable().describe('Offset relative to daily reset (0:00 UTC).')
    },
    authorization: {
        key: 'team', team: [ 'read', 'updateTime' ]
    },
    async execute({ guild, team: snowflake, time: timeIndex, duration, day, reset }){
        const team = await database.team.findUniqueOrThrow({
            where: { snowflake, guild },
            select: {
                id: true,
                primaryTimeZone: true,
                daylightSavings: true,
                mention: true
            }
        })

        const current = await database.teamTime.findUniqueOrThrow({
            where: {
                teamId_index: {
                    teamId: team.id,
                    index: timeIndex
                }
            },
            select: {
                id: true,
                time: true
            }
        })

        const now = Temporal.Now.zonedDateTimeISO('UTC')
        const today = now.round({ smallestUnit: 'day', roundingMode: 'floor' })
        const time = await database.teamTime.update({
            where: { id: current.id },
            data: {
                time: day !== null || reset !== null ?
                    new Date(today.subtract({ days: today.dayOfWeek })
                        .add({ days: day ?? toTemporalInstant.apply(current.time).toZonedDateTimeISO('UTC').dayOfWeek })
                        .add(reset ? Temporal.Duration.from({ minutes: (reset * 60)|0 }) : now.since(today))
                        .epochMilliseconds)
                    : undefined,
                duration: duration ?? undefined
            },
            select: {
                index: true,
                nextRun: true
            }
        })
        return `Time ${time.index} for team ${team.mention} updated successfully! New time: ${time.nextRun(team)}`
    }
})
