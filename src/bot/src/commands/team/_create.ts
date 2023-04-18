import { subcommand } from '../_command.js'
import { djs } from '../_djs.js'
import { z } from 'zod'
import { database } from '../../util/database.js'
import { slugify } from '@glenna/util'
import { debug } from '../../util/logging.js'
import { EmbedBuilder } from '@glenna/discord'
import { slashCommandMention, teamMember } from '../_reference.js'
import type { TeamMemberRole } from '@glenna/prisma'
import { PublicError } from '../../PublicError.js'

export const create = subcommand({
    description: 'Create a new raid team.',
    input: z.object({
        name: z.string().describe('Team name.'),
        channel: djs.channel().nullable().describe('Team channel.'),
        role: djs.role().nullable().describe('Team role for member syncing and pinging.'),
        source: djs.guild(),
        guild: djs.guild().transform(database.guild.transformOrThrow({
            id: true,
            divisions: {
                where: { primary: true },
                select: { id: true }
            },
            permission: {
                select: {
                    anyMemberRoleId: true,
                    anyTeamMemberRoleId: true,
                    anyTeamRepresentativeRoleId: true,
                    anyTeamCaptainRoleId: true
                }
            },
            managerTeam: {
                select: {
                    id: true,
                    permission: {
                        select: {
                            memberRoleId: true,
                            representativeRoleId: true,
                            captainRoleId: true
                        }
                    }
                }
            }
        })),
    }),
    authorization: {
        guild: [ 'createTeam' ]
    },
    async execute({
        name, channel, role, source, guild,
        guild: {
            divisions: [division],
            permission: guildPermissions,
            managerTeam
        }
    }, interaction) {
        if(!division)
            throw new PublicError(`Fatal error: guild ${guild.id} is missing a primary division!`)
        if(!guildPermissions)
            throw new PublicError(`Fatal error: guild ${guild.id} is missing permissions!`)
        if(!managerTeam)
            throw new PublicError(`Fatal error: guild ${guild.id} is missing a manager team!`)
        const managerPermissions = managerTeam.permission
        if(!managerPermissions)
            throw new PublicError(`Fatal error: manager team ${managerTeam.id} for guild ${guild.id} is missing permissions!`)
        const snowflakes = await database.snowflakes("member", "representative", "captain")
        const team = await database.team.create({
            data: {
                name,
                role: role ? BigInt(role.id) : null,
                channel: channel ? BigInt(channel.id) : null,
                alias: slugify(name),
                guild: { connect: { id: guild.id }},
                division: { connect: division },
                roles: {
                    createMany: {
                        data: [
                            { type: 'TeamMember', guildId: guild.id, snowflake: snowflakes.member },
                            { type: 'TeamRepresentative', guildId: guild.id, snowflake: snowflakes.representative },
                            { type: 'TeamCaptain', guildId: guild.id, snowflake: snowflakes.captain }
                        ]
                    }
                },
                permission: {
                    create: {
                        members: { connect: { snowflake: snowflakes.member }},
                        representatives: { connect: { snowflake: snowflakes.representative }},
                        captains: { connect: { snowflake: snowflakes.captain }},

                        read: { connect: { id: guildPermissions.anyMemberRoleId }},
                        update: { connect: { id: managerPermissions.memberRoleId }},
                        delete: { connect: { id: managerPermissions.memberRoleId }},

                        updateDivision: { connect: { id: managerPermissions.memberRoleId }},
                        updateRole: { connect: { id: managerPermissions.memberRoleId }},

                        createMember: { connect: { id: managerPermissions.memberRoleId }},
                        updateMember: { connect: { id: managerPermissions.memberRoleId }},
                        deleteMember: { connect: { id: managerPermissions.memberRoleId }},
                        readMember: { connect: { id: guildPermissions.anyMemberRoleId }},

                        createTime: { connect: { id: managerPermissions.memberRoleId }},
                        updateTime: { connect: { id: managerPermissions.memberRoleId }},
                        deleteTime: { connect: { id: managerPermissions.memberRoleId }},
                        readTime: { connect: { id: guildPermissions.anyMemberRoleId }},
                    }
                }
            },
            select: {
                id: true,
                name: true,
                type: true,
                snowflake: true,
                role: true,
                mention: true,
                permission: {
                    select: {
                        memberRoleId: true,
                        representativeRoleId: true,
                        captainRoleId: true
                    }
                }
            }
        })
        debug(`Create team "${team.name}" (${team.id}) in guild "${source.name}" (${guild.id})`)

        // establish parent/child relationships for the new roles
        await database.roleChild.createMany({
            data: [
                { parentId: guildPermissions.anyTeamMemberRoleId, childId: team.permission!.memberRoleId },
                { parentId: guildPermissions.anyTeamRepresentativeRoleId, childId: team.permission!.representativeRoleId },
                { parentId: guildPermissions.anyTeamCaptainRoleId, childId: team.permission!.captainRoleId },
                { parentId: team.permission!.memberRoleId, childId: team.permission!.representativeRoleId },
                { parentId: team.permission!.representativeRoleId, childId: team.permission!.captainRoleId },
                { parentId: team.permission!.captainRoleId, childId: managerPermissions.memberRoleId }, // all managers have at least captain access on a team
            ]
        })

        const members: { id: string, role: TeamMemberRole }[] = []
        if(role){
            await source.members.fetch()
            const realizedRole = await source.roles.fetch(role.id)
            if(!realizedRole)
                throw `Could not fetch role with members!`
            for(const member of realizedRole.members.values()){
                const role = team.type === 'Management' && source.ownerId === member.user.id ? 'Captain' : 'Member'
                members.push({ id: member.id, role })
                debug(`Adding "${member.displayName}" to "${team.name}".`)
                const guildMember = await database.guildMember.findOrCreate(guild, member)
                await database.teamMember.add(team, guildMember, { role })
            }
        }

        return {
            embeds: [
                new EmbedBuilder({
                    color: 0x40a86d,
                    title: `Team ${team.name} Created`,
                    description: `${team.mention} has been registered.`,
                    fields: [
                        {
                            name: 'Members',
                            value: members.length > 0
                                ? members.map(a => `- ${teamMember(a)}`).join(`\n`)
                                : team.role !== null
                                    ? `*Add members to <@&${team.role}> to add them to this team.*`
                                    : `*Use ${slashCommandMention(interaction, 'team', 'member', 'add')} to add members to this team.*`
                        }
                    ]
                })
            ]
        }
    }
})
