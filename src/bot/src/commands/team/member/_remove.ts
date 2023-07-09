import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { debug } from '../../../util/logging.js'
import { PublicError } from '../../../PublicError.js'
import { teamMember } from './__common.js'

export const remove = subcommand({
    description: 'Remove a member from a team.',
    input: {
        team: djs.team().describe('The team to modify.'),
        member: teamMember().describe('The member to remove.'),
        source: djs.guild(),
        actor: djs.actor(),
    },
    authorization: {
        key: 'team', team: [ 'deleteMember' ]
    },
    async execute({ team: snowflake, member, source }){
        const team = await database.team.findUniqueOrThrow({
            where: { snowflake, guild: { snowflake: BigInt(source.id) }},
            select: {
                id: true,
                name: true,
                role: true,
                mention: true
            }
        })

        if(team.role !== null)
            throw new PublicError(`Cannot remove members from ${team.mention} because it is using role synchronization.`)

        const teamMember = await database.teamMember.findFirstOrThrow({
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
        await database.teamMember.delete({ where: { id: teamMember.id }})
        debug(`Removed ${teamMember.computed.displayName} from team ${team.name} (${team.id}).`)

        return {
            embeds: [
                {
                    color: 0x40a86d,
                    title: `Team ${team.name} Member Removed`,
                    fields: [
                        {
                            name: 'Removed Member',
                            value: `<@${teamMember.member.snowflake}>`
                        }
                    ]
                }
            ]
        }
    }
})
