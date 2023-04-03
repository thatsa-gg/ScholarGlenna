import { z } from 'zod'
import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { debug } from '../../../util/logging.js'
import { EmbedBuilder } from '@glenna/discord'
import { PublicError } from '../../../PublicError.js'
import { TeamMemberRole } from '@glenna/prisma'

export const update = subcommand({
    description: 'Update a member on a team.',
    input: z.object({
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to modify.'),
        member: djs.index().describe('The member to remove.'),
        role: z.nativeEnum(TeamMemberRole).nullable().describe("The member's new role on the team."),
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        actor: djs.actor(),
        source: djs.guild(),
    }),
    async authorize({ guild, actor, team: alias }){
        const team = await database.team.findUnique({
            where: { guildId_alias: { guildId: guild.id, alias }},
            select: { type: true }
        })
        return database.isAuthorized(guild, BigInt(actor.id), {
            // only management team captains can modify the roster of management teams
            role: team?.type === 'Management' ? 'Captain' : undefined,
            team: { type: 'Management' }
        })
    },
    async execute({ team: alias, member, source, guild, role }){
        const team = await database.team.findUniqueOrThrow({
            where: { guildId_alias: { guildId: guild.id, alias: alias }},
            select: {
                id: true,
                type: true,
                name: true,
                mention: true,
            }
        })
        const teamMember = await database.teamMember.findUniqueOrThrow({
            where: { id: member },
            select: {
                id: true,
                team: { select: { id: true }},
                computed: { select: { displayName: true }},
                member: { select: { snowflake: true }}
            }
        })
        if(teamMember.team.id !== team.id)
            throw new PublicError(`Member is not part of team.`)

        // owner of the server *must* be a captain on management teams
        if(role && team.type === 'Management' && source.ownerId === teamMember.member.snowflake.toString())
            role = 'Captain'

        const newMember = await database.teamMember.update({
            where: {
                teamId_memberId: {
                    teamId: team.id,
                    memberId: member
                }
            },
            data: {
                role: role ?? undefined,
            },
            select: {
                role: true,
                member: {
                    select: {
                        mention: true
                    }
                }
            }
        })
        debug(`Updated ${teamMember.computed.displayName} on team ${team.name}: ${JSON.stringify({ role })}`)

        return {
            embeds: [
                new EmbedBuilder({
                    color: 0x40a86d,
                    title: `Team ${team.name} Member Updated`,
                    fields: [
                        {
                            name: 'Updated Member',
                            value: newMember.member.mention,
                        },
                        ... !role ? [] : [{ name: 'Role', value: role }]
                    ]
                })
            ]
        }
    },
    async autocomplete({ name, value }, interaction){
        if(name === 'team')
            return await database.team.autocomplete(BigInt(interaction.guild!.id), value, { member: BigInt(interaction.user.id), orManager: true })
        if(name === 'member')
            return await database.teamMember.autocomplete(BigInt(interaction.guild!.id), interaction.options.getString('team'), value, BigInt(interaction.user.id))

        return
    }
})
