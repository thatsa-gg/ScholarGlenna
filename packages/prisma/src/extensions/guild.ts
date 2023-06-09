import { Prisma } from '../../generated/client/index.js'
import { safeUsername } from '../index.js'
import { snowflakes } from './client.js'
import type { Guild } from '@glenna/discord'

export const guildExtension = Prisma.defineExtension(client => client.$extends({
    model: {
        guild: {
            async import(guild: Guild){
                const owner = await guild.fetchOwner()
                const guildId = BigInt(guild.id)
                const ownerId = BigInt(owner.id)
                client.$transaction(async client => {
                    const guildAlias = guild.vanityURLCode && 0 === await client.guild.count({ where: { alias: guild.vanityURLCode }})
                        ? guild.vanityURLCode
                        : guildId.toString(36)
                    const roles = await snowflakes(client,
                        "guildMember",
                        "teamMember", "teamRepresentative", "teamCaptain",
                        "managementMember", "managementRepresentative", "managementCaptain"
                    )
                    const publicRole = await client.role.findFirstOrThrow({ where: { type: 'Public' }, select: { id: true }})
                    const superUserRole = await client.role.findFirstOrThrow({ where: { type: 'SuperUser' }, select: { id: true }})

                    // create the new guild, its roles, its permissions, and its primary division
                    const newGuild = await client.guild.create({
                        data: {
                            name: guild.name,
                            snowflake: guildId,
                            alias: guildAlias,
                            acronym: guild.nameAcronym,
                            icon: guild.icon,
                            roles: {
                                createMany: {
                                    data: [
                                        { type: 'AnyGuildMember', snowflake: roles.guildMember },
                                        { type: 'AnyTeamMember', snowflake: roles.teamMember, },
                                        { type: 'AnyTeamRepresentative', snowflake: roles.teamRepresentative },
                                        { type: 'AnyTeamCaptain', snowflake: roles.teamCaptain },

                                        { type: 'ManagementMember', snowflake: roles.managementMember },
                                        { type: 'ManagementRepresentative', snowflake: roles.managementRepresentative },
                                        { type: 'ManagementCaptain', snowflake: roles.managementCaptain },
                                    ]
                                }
                            },
                            permission: {
                                create: {
                                    members: { connect: { snowflake: roles.guildMember }},
                                    teamMembers: { connect: { snowflake: roles.teamMember }},
                                    teamRepresentatives: { connect: { snowflake: roles.teamRepresentative }},
                                    teamCaptains: { connect: { snowflake: roles.teamCaptain }},
                                    managers: { connect: { snowflake: roles.managementMember }},
                                    managerRepresentatives: { connect: { snowflake: roles.managementRepresentative }},
                                    managerCaptains: { connect: { snowflake: roles.managementCaptain }},

                                    read: { connect: { snowflake: roles.guildMember }},
                                    update: { connect: { snowflake: roles.managementCaptain }},
                                    createTeam: { connect: { snowflake: roles.managementMember }},
                                    createDivision: { connect: { snowflake: roles.managementMember }},
                                }
                            },
                            divisions: {
                                create: {
                                    name: guild.name,
                                    primary: true,
                                    permission: {
                                        create: {
                                            read: { connect: { snowflake: roles.guildMember }},
                                            update: { connect: { snowflake: roles.managementMember }},
                                            delete: {}
                                        }
                                    },
                                }
                            }
                        },
                        select: {
                            id: true,
                            divisions: { select: { id: true }},
                            permission: {
                                select: {
                                    anyMemberRoleId: true,
                                    anyTeamMemberRoleId: true,
                                    anyTeamRepresentativeRoleId: true,
                                    anyTeamCaptainRoleId: true,
                                    managementMemberRoleId: true,
                                    managementRepresentativeRoleId: true,
                                    managementCaptainRoleId: true
                                }
                            }
                        }
                    })

                    // create the first management team
                    const managementTeam = await client.team.create({
                        data: {
                            guild: { connect: { id: newGuild.id }},
                            division: { connect: { id: newGuild.divisions[0]!.id }},
                            alias: 'management-team',
                            name: 'Management Team',
                            type: 'Management',
                            capacity: null,
                            permission: {
                                create: {
                                    // The team roles aren't used anywhere else by snowflake, so we'll just make them in here instead of pre-populating the table.
                                    members: { create: { type: 'TeamMember', guild: { connect: { id: newGuild.id }}}},
                                    representatives: { create: { type: 'TeamRepresentative', guild: { connect: { id: newGuild.id }}}},
                                    captains: { create: { type: 'TeamCaptain', guild: { connect: { id: newGuild.id }}}},

                                    read: { connect: { snowflake: roles.guildMember }},
                                    update: { connect: { snowflake: roles.managementCaptain }},
                                    delete: {},

                                    updateDivision: {},
                                    updateRole: { connect: { snowflake: roles.managementCaptain }},

                                    createMember: { connect: { snowflake: roles.managementCaptain }},
                                    updateMember: { connect: { snowflake: roles.managementCaptain }},
                                    deleteMember: { connect: { snowflake: roles.managementCaptain }},
                                    readMember: { connect: { snowflake: roles.guildMember }},

                                    createTime: {},
                                    updateTime: {},
                                    deleteTime: {},
                                    readTime: {},
                                }
                            }
                        },
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
                    })

                    // establish parent/child relationships for the new roles
                    await client.roleChild.createMany({
                        data: [
                            // all guild members are public members
                            { parentId: publicRole.id, childId: newGuild.permission!.anyMemberRoleId },

                            // all team members are members, and each role is a member of the one below it
                            { parentId: newGuild.permission!.anyMemberRoleId, childId: newGuild.permission!.anyTeamMemberRoleId },
                            { parentId: newGuild.permission!.anyTeamMemberRoleId, childId: newGuild.permission!.anyTeamRepresentativeRoleId },
                            { parentId: newGuild.permission!.anyTeamRepresentativeRoleId, childId: newGuild.permission!.anyTeamCaptainRoleId },

                            // all managers are members, and each role is a member of the one below it
                            { parentId: newGuild.permission!.anyMemberRoleId, childId: newGuild.permission!.managementMemberRoleId },
                            { parentId: newGuild.permission!.managementMemberRoleId, childId: newGuild.permission!.managementRepresentativeRoleId },
                            { parentId: newGuild.permission!.managementRepresentativeRoleId, childId: newGuild.permission!.managementCaptainRoleId },

                            // team roles are part of the corresponding any role
                            { parentId: newGuild.permission!.anyTeamMemberRoleId, childId: managementTeam.permission!.memberRoleId },
                            { parentId: newGuild.permission!.anyTeamRepresentativeRoleId, childId: managementTeam.permission!.representativeRoleId },
                            { parentId: newGuild.permission!.anyTeamCaptainRoleId, childId: managementTeam.permission!.captainRoleId },

                            // team roles are part of the ones below them
                            { parentId: managementTeam.permission!.memberRoleId, childId: managementTeam.permission!.representativeRoleId },
                            { parentId: managementTeam.permission!.representativeRoleId, childId: managementTeam.permission!.captainRoleId },

                            // management members have at least captain access on a team
                            { parentId: managementTeam.permission!.captainRoleId, childId: newGuild.permission!.managementMemberRoleId },

                            // management team roles are members of the corresponding guild-level roles
                            { parentId: newGuild.permission!.managementMemberRoleId, childId: managementTeam.permission!.memberRoleId },
                            { parentId: newGuild.permission!.managementRepresentativeRoleId, childId: managementTeam.permission!.representativeRoleId },
                            { parentId: newGuild.permission!.managementCaptainRoleId, childId: managementTeam.permission!.captainRoleId },

                            // all superusers are considered guild captains
                            { parentId: newGuild.permission!.managementCaptainRoleId, childId: superUserRole.id },
                        ]
                    })

                    // now that the permission tables are set up, we can create the guild leader
                    await client.teamMember.create({
                        data: {
                            team: { connect: { id: managementTeam.id }},
                            role: 'Captain',
                            member: {
                                create: {
                                    snowflake: ownerId,
                                    name: owner.nickname,
                                    icon: owner.avatar,
                                    guild: { connect: { snowflake: guildId }},
                                    user: {
                                        connectOrCreate: {
                                            where: { snowflake: ownerId },
                                            create: {
                                                snowflake: ownerId,
                                                name: safeUsername(owner.user),
                                                icon: owner.user.avatar
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    })
                })
            }
        }
    }
}))
