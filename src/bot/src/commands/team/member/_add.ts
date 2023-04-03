import { z } from 'zod'
import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { debug } from '../../../util/logging.js'
import { EmbedBuilder } from '@glenna/discord'
import { TeamMemberRole } from '@glenna/prisma'
import { teamMember } from '../../_reference.js'
import { PublicError } from '../../../PublicError.js'

export const add = subcommand({
    description: 'Add a member to a team.',
    input: z.object({
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to modify.'),
        member: djs.user().describe('The member to add.'),
        role: z.nativeEnum(TeamMemberRole).nullable().transform(a => a ?? 'Member').describe("The new member's role on the team."),
        source: djs.guild(),
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        actor: djs.actor(),
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
    async execute({ team: teamAlias, member: user, role, source, guild }){
        const member = await source.members.fetch(user)
        if(!member)
            throw `Could not find member in guild.`
        const team = await database.team.findUniqueOrThrow({
            where: { guildId_alias: { guildId: guild.id, alias: teamAlias }},
            select: {
                id: true,
                type: true,
                name: true,
                role: true,
                mention: true
            }
        })

        if(team.role !== null)
            throw new PublicError(`Cannot add members to ${team.mention} because it is using role synchronization.`)

        // owner of the server *must* be a captain on management teams
        if(team.type === 'Management' && user.id === source.ownerId)
            role = 'Captain'

        const guildMember = await database.guildMember.findOrCreate(guild, member)
        await database.teamMember.add(team, guildMember, { role })

        const username = member.nickname ?? `${user.username}#${user.discriminator}`
        debug(`Added ${username} to team ${team.name} (${team.id}).`)

        return {
            embeds: [
                new EmbedBuilder({
                    color: 0x40a86d,
                    title: `Team ${team.name} Member Added`,
                    fields: [
                        {
                            name: `Added ${role}`,
                            value: teamMember({ id: member.id, role })
                        }
                    ]
                })
            ]
        }
    },
    async autocomplete({ name, value }, interaction){
        if(name === 'team')
            return await database.team.autocomplete(BigInt(interaction.guild!.id), value, { member: BigInt(interaction.user.id), orManager: true })

        return
    }
})
