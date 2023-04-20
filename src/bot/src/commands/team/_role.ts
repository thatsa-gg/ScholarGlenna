import { database } from '../../util/database.js'
import { subcommand } from '../_command.js'
import { djs } from '../_djs.js'
import { slashCommandMention, teamMember } from '../_reference.js'
import type { TeamMemberRole } from '@glenna/prisma'
import { PublicError } from '../../PublicError.js'

export const role = subcommand({
    description: `Modify or remove a team's role.`,
    input: {
        team: djs.team().describe('The team to modify.'),
        role: djs.role().nullable().describe('The new role.'),
        remove: djs.stringEnum([ 'Keep Roster', 'Clear Roster' ]).nullable().describe('Should the role be removed? What should happen to the roster?'),
        source: djs.guild(),
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        actor: djs.actor(),
    },
    authorization: { key: 'team', team: [ 'updateRole' ]},
    async execute({ team: snowflake, role, remove, guild, source }, interaction){
        const team = await database.team.findUniqueOrThrow({
            where: { snowflake, guild },
            select: {
                id: true,
                name: true,
                type: true,
                role: true,
            }
        })

        if(remove !== null){
            if(remove === 'Clear Roster')
                await database.teamMember.safeDelete(team)
            const newTeam = await database.team.update({
                where: { id: team.id },
                data: { role: null },
                select: {
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
            return {
                embeds: [
                    {
                        color: 0x40a86d,
                        title: `Team ${team.name} Updated`,
                        description: `${team.name} no longer has a role.`,
                        fields: [
                            {
                                name: 'Members',
                                value: newTeam.members.length > 0
                                    ? newTeam.members
                                        .map(member => `- ${teamMember({ id: member.member.snowflake, role: member.role })}`)
                                        .join('\n')
                                    : `*Use ${slashCommandMention(interaction, 'team', 'member', 'add')} to add members to this team.*`
                            }
                        ]
                    }
                ]
            }
        } else if(role !== null){
            const discordRole = await source.roles.fetch(role.id)
            if(!discordRole)
                throw new PublicError(`Could not fetch Discord role member list!`)
            await database.teamMember.safeDelete(team)
            await database.team.update({ where: { id: team.id }, data: { role: BigInt(role.id) }})
            const members: { id: string, role: TeamMemberRole }[] = []
            for(const member of discordRole.members.values()){
                const role = team.type === 'Management' && source.ownerId === member.user.id ? 'Captain' : 'Member'
                members.push({ id: member.id, role })
                const guildMember = await database.guildMember.findOrCreate(guild, member)
                await database.teamMember.add(team, guildMember, { role })
            }

            return {
                embeds: [
                    {
                        color: 0x40a86d,
                        title: `Team ${team.name} Updated`,
                        description: `${team.name} is now tracking <@&${role.id}>.`,
                        fields: [
                            {
                                name: 'Members',
                                value: members.length > 0
                                    ? members
                                        .map(member => `- ${teamMember(member)}`)
                                        .join('\n')
                                    : `*Add members to <@&${role.id}> to add them to this team.*`
                            }
                        ]
                    }
                ]
            }
        } else {
            throw new PublicError(`You must choose to either set or remove a role.`)
        }
    }
})
