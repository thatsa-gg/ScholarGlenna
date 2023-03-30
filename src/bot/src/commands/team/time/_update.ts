import { z } from 'zod'
import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { Temporal, toTemporalInstant } from '@js-temporal/polyfill'

const Days = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
}

export const update = subcommand({
    description: `Alter a team time (UTC).`,
    input: z.object({
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to update times for.'),
        time: djs.index().describe('The time to update.'),
        duration: djs.number(15, 1440).nullable().describe('The new duration in minutes.'),
        day: z.enum([ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]).nullable().describe('Day-of-week (in UTC).'),
        reset: djs.number(-24, 24).nullable().describe('Offset relative to daily reset (0:00 UTC).')
    }),
    async execute({ guild, team: teamName, time: timeIndex, duration, day, reset }){
        const team = await database.team.findUniqueOrThrow({
            where: { guildId_alias: { guildId: guild.id, alias: teamName }},
            select: {
                id: true,
                primaryTimeZone: true,
                daylightSavings: true
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
                        .add({ days: day ? Days[day] : toTemporalInstant.apply(current.time).toZonedDateTimeISO('UTC').dayOfWeek })
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
        return `Time ${time.index} updated successfully! New time: ${time.nextRun(team)}`
    },
    async autocomplete({ name, value }, interaction) {
        if(name === 'team')
            return await database.team.autocomplete(BigInt(interaction.guild!.id), value)
        else if(name === 'time')
            return await database.teamTime.autocomplete(BigInt(interaction.guild!.id), interaction.options.getString('team'))

        return
    },
})
