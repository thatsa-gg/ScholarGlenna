import { z } from 'zod'
import { database } from '../../util/database.js'
import { subcommand } from '../_chat-command.js'
import { djs } from '../_djs.js'
import { EmbedBuilder } from '@glenna/discord'
import { debug } from '../../util/logging.js'

export const members = subcommand({
    description: `Fetch a team's members.`,
    input: z.object({
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to fetch.'),
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
    }),
    async execute({ team: teamName, guild }){
        const team = await database.team.findUniqueOrThrow({
            where: { guildId_alias: { guildId: guild.id, alias: teamName }},
            select: {
                type: true,
                mention: true,
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

        const members = team.members.map(({ role, member: { snowflake }}) => `<@${snowflake}>${role === 'Member' ? '' : ` (${role})`}`)

        return {
            embeds: [
                new EmbedBuilder({
                    color: 0x40a86d,
                    title: `Team ${team.mention}`,
                    fields: [
                        {
                            name: 'Members',
                            value: members.length > 0 ? members.map(a => `- ${a}`).join(`\n`) : `*Use \`/team add\` to add members to this team.*`
                        }
                    ]
                })
            ]
        }
    },
    async autocomplete({ name, value }, interaction){
        debug(`Processing team.members autocomplete: ${name}=${value}.`)
        if(name === 'team'){
            const teams = await database.team.findMany({
                where: {
                    guild: { snowflake: BigInt(interaction.guild!.id) },
                    OR: [
                        { name: { startsWith: value }},
                        { alias: { startsWith: value }}
                    ]
                },
                select: {
                    name: true,
                    alias: true
                }
            })
            debug({ teams })
            return teams.map(({ name, alias: value }) => ({ name, value }))
        }

        return
    }
})
