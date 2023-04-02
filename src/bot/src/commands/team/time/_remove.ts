import { z } from 'zod'
import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'

export const remove = subcommand({
    description: `Remove a team time (UTC).`,
    input: z.object({
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to update times for.'),
        time: djs.index().describe('The time to update.')
    }),
    async execute({ guild, team: teamName, time: timeIndex }){
        const team = await database.team.findUniqueOrThrow({
            where: { guildId_alias: { guildId: guild.id, alias: teamName }},
            select: {
                id: true,
                primaryTimeZone: true,
                daylightSavings: true,
                mention: true
            }
        })

        await database.teamTime.delete({
            where: {
                teamId_index: {
                    teamId: team.id,
                    index: timeIndex
                }
            }
        })

        await database.teamTime.updateMany({
            where: {
                teamId: team.id,
                index: { gt: timeIndex }
            },
            data: { index: { decrement: 1 }}
        })

        return `Time ${timeIndex} removed from team ${team.mention}.`
    },
    async autocomplete({ name, value }, interaction) {
        if(name === 'team')
            return await database.team.autocomplete(BigInt(interaction.guild!.id), value)
        else if(name === 'time')
            return await database.teamTime.autocomplete(BigInt(interaction.guild!.id), interaction.options.getString('team'))

        return
    },
})
