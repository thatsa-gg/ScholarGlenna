import { formatDuration } from '@glenna/util'
import { z } from 'zod'
import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'

export const update = subcommand({
    description: `Alter a team time.`,
    input: z.object({
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to update times for.'),
        time: djs.index().describe('The time to update.'),
        duration: djs.number(15, 1440).nullable().describe('The new duration in minutes.'),
        //new: djs.string()
    }),
    async execute({ guild, team: teamName, time: timeIndex, duration }){
        const team = await database.team.findUniqueOrThrow({
            where: { guildId_alias: { guildId: guild.id, alias: teamName }},
            select: {
                id: true
            }
        })
        await database.teamTime.update({
            where: {
                teamId_index: {
                    teamId: team.id,
                    index: timeIndex
                }
            },
            data: {
                duration: duration ?? undefined
            }
        })
        return `Time updated successfully! New time: `
    },
    async autocomplete({ name, value }, interaction) {
        if(name === 'team')
            return await database.team.autocomplete(BigInt(interaction.guild!.id), value)
        else if(name === 'time'){
            const teamName = interaction.options.getString('team')
            if(!teamName)
                return
            const team = await database.team.findFirst({
                where: {
                    guild: { snowflake: BigInt(interaction.guild!.id) },
                    alias: teamName
                },
                select: {
                    nextRunTimes: true
                }
            })
            if(!team)
                return
            const times = await team.nextRunTimes()
            return times.map(time => ({
                name: `(${time.index}) ${time.time.withTimeZone('UTC')} for ${formatDuration(time.duration)}`,
                value: time.index
            }))
        }

        return
    },
})
