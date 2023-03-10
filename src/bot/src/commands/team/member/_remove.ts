import { z } from 'zod'
import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { debug } from '../../../util/logging.js'
import { EmbedBuilder } from '@glenna/discord'

export const add = subcommand({
    description: 'Add a member to a team.',
    input: z.object({
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to modify.'),
        member: djs.string(b => b.setAutocomplete(true))
            .regex(/^\d+$/, `Member must be a numeric identifier.`)
            .transform(member => Number(member))
            .describe('The member to remove.'),
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true }))
    }),
    async execute({ team: teamName, member, guild }){
        const team = await database.team.findUniqueOrThrow({
            where: { guildId_alias: { guildId: guild.id, alias: teamName }},
            select: {
                id: true,
                name: true,
                mention: true
            }
        })
        const teamMember = await database.teamMember.findFirstOrThrow({
            where: { id: member },
            select: {
                id: true,
                team: { select: { id: true }},
                computed: { select: { displayName: true }},
                member: { select: { snowflake: true }}
            }
        })
        if(teamMember.team.id !== team.id)
            throw `Member is not part of team.`
        await database.teamMember.delete({ where: { id: teamMember.id }})
        debug(`Removed ${teamMember.computed.displayName} from team ${team.name} (${team.id}).`)

        return {
            embeds: [
                new EmbedBuilder({
                    color: 0x40a86d,
                    title: `Team ${team.mention}`,
                    fields: [
                        {
                            name: 'Removed Member',
                            value: `<@${teamMember.member.snowflake}>`
                        }
                    ]
                })
            ]
        }
    },
    async autocomplete({ name, value }, interaction){
        if(name === 'team')
            return await database.team.autocomplete(BigInt(interaction.guild!.id), value)
        if(name === 'member'){
            const alias = interaction.options.getString('team')
            if(!alias)
                return []
            const team = await database.team.findFirst({
                where: {
                    guild: { snowflake: BigInt(interaction.guild!.id) },
                    alias
                },
                select: {
                    members: {
                        where: {
                            OR: [
                                { member: { name: { startsWith: value }}},
                                { member: { user: { name: { startsWith: value }}}}
                            ]
                        },
                        select: {
                            id: true,
                            computed: { select: { displayName: true }}
                        }
                    }
                }
            })
            if(!team)
                return []
            return team.members.map(member => ({ name: member.computed.displayName, value: member.id }))
        }

        return
    }
})
