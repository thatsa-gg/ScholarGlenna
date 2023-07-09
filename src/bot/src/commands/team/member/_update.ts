import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { debug } from '../../../util/logging.js'
import { PublicError } from '../../../PublicError.js'
import { TeamMemberRole } from '@glenna/prisma'
import { teamMember } from './__common.js'

export const update = subcommand({
    description: 'Update a member on a team.',
    input: {
        team: djs.team().describe('The team to modify.'),
        member: teamMember().describe('The member to remove.'),
        role: djs.nativeEnum(TeamMemberRole).nullable().describe("The member's new role on the team."),
        actor: djs.actor(),
        source: djs.guild(),
    },
    authorization: {
        // TODO: restrict role update authorization to lower roles only
        key: 'team', team: 'updateMember'
    },
    async execute({ team: snowflake, member, source, role }){
        const team = await database.team.findUniqueOrThrow({
            where: { snowflake, guild: { snowflake: BigInt(source.id) }},
            select: {
                id: true,
                type: true,
                name: true,
                mention: true,
            }
        })
        const teamMember = await database.teamMember.findUniqueOrThrow({
            where: { snowflake: member, team: { id: team.id }},
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
            where: { id: teamMember.id },
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
                {
                    color: 0x40a86d,
                    title: `Team ${team.name} Member Updated`,
                    fields: [
                        {
                            name: 'Updated Member',
                            value: newMember.member.mention,
                        },
                        ... !role ? [] : [{ name: 'Role', value: role }]
                    ]
                }
            ]
        }
    }
})
