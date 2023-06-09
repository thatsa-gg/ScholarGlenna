import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { slashCommandMention, teamMember } from '../../_reference.js'

export const list = subcommand({
    description: `Fetch a team's members.`,
    input: {
        team: djs.team().describe('The team to fetch.'),
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
    },
    authorization: {
        key: 'team', team: 'read'
    },
    async execute({ team: snowflake, guild }, interaction){
        const team = await database.team.findUniqueOrThrow({
            where: { snowflake, guild },
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
                {
                    color: 0x40a86d,
                    title: `Team ${team.name} Roster`,
                    description: members.length > 0
                        ? members.map(a => `- ${a}`).join(`\n`)
                        : team.role !== null
                            ? `*Add members to <@&${team.role}> to add them to this team.*`
                            : `*Use ${slashCommandMention(interaction, 'team', 'member', 'add')} to add members to this team.*`
                }
            ]
        }
    }
})
