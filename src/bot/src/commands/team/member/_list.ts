import { z } from 'zod'
import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { EmbedBuilder } from '@glenna/discord'
import { slashCommandMention, teamMember } from '../../_reference.js'

export const list = subcommand({
    description: `Fetch a team's members.`,
    input: z.object({
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to fetch.'),
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
    }),
    async execute({ team: teamName, guild }, interaction){
        const team = await database.team.findUniqueOrThrow({
            where: { guildId_alias: { guildId: guild.id, alias: teamName }},
            select: {
                type: true,
                name: true,
                role: true,
                members: {
                    select: {
                        role: true,
                        member: {
                            select: {
                                snowflake: true
                            }
                        }
                    }
                }
            }
        })

        const members = team.members.map(({ role, member: { snowflake }}) => teamMember({ id: snowflake, role }))

        return {
            embeds: [
                new EmbedBuilder({
                    color: 0x40a86d,
                    title: `Team ${team.name}`,
                    fields: [
                        {
                            name: 'Members',
                            value: members.length > 0
                                ? members.map(a => `- ${a}`).join(`\n`)
                                : team.role !== null
                                    ? `*Add members to <@&${team.role}> to add them to this team.*`
                                    : `*Use ${slashCommandMention(interaction, 'team', 'member', 'add')} to add members to this team.*`
                        }
                    ]
                })
            ]
        }
    },
    async autocomplete({ name, value }, interaction){
        if(name === 'team')
            return await database.team.autocomplete(BigInt(interaction.guild!.id), value)

        return
    }
})
