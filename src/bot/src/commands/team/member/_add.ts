import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { debug } from '../../../util/logging.js'
import { TeamMemberRole } from '@glenna/prisma'
import { teamMember } from '../../_reference.js'
import { PublicError } from '../../../PublicError.js'

export const add = subcommand({
    description: 'Add a member to a team.',
    input: {
        team: djs.team().describe('The team to modify.'),
        member: djs.user().describe('The member to add.'),
        role: djs.nativeEnum(TeamMemberRole).nullable().transform(a => a ?? 'Member').describe("The new member's role on the team."),
        source: djs.guild(),
    },
    authorization: {
        key: 'team', team: 'createMember'
    },
    async execute({ team: snowflake, member: user, role, source }){
        const guild = await database.guild.findUniqueOrThrow({
            where: { snowflake: BigInt(source.id) },
            select: { id: true }
        })
        const member = await source.members.fetch(user)
        if(!member)
            throw `Could not find member in guild.`
        const team = await database.team.findUniqueOrThrow({
            where: { snowflake, guild },
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

        const username = member.nickname ?? user.username
        debug(`Added ${username} to team ${team.name} (${team.id}).`)

        return {
            embeds: [
                {
                    color: 0x40a86d,
                    title: `Team ${team.name} Member Added`,
                    fields: [
                        {
                            name: `Added ${role}`,
                            value: teamMember({ id: member.id, role })
                        }
                    ]
                }
            ]
        }
    }
})
