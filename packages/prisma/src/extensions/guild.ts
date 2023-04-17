import { Prisma, RoleType, type Role } from '../../generated/client/index.js'
import type { Guild } from '@glenna/discord'
import { bigint, z } from 'zod'

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
                    const roles = z.object({
                        guildMember: z.bigint(),
                        teamMember: z.bigint(),
                        teamRepresentative: z.bigint(),
                        teamCaptain: z.bigint(),
                        managementMember: z.bigint(),
                        managementRepresentative: z.bigint(),
                        managementCaptain: z.bigint(),
                    }).array().length(1).parse(await client.$queryRaw`
                        select
                            new_snowflake() as "guildMember",
                            new_snowflake() as "teamMember",
                            new_snowflake() as "teamRepresentative",
                            new_snowflake() as "teamCaptain",
                            new_snowflake() as "managementMember",
                            new_snowflake() as "managementRepresentative",
                            new_snowflake() as "managementCaptain"
                    `)[0]!
                    const publicRole = await client.role.findFirstOrThrow({ where: { type: 'Public' }, select: { id: true }})
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
                                        { type: 'TeamMember', snowflake: roles.managementMember },
                                        { type: 'TeamRepresentative', snowflake: roles.managementRepresentative },
                                        { type: 'TeamCaptain', snowflake: roles.managementCaptain }
                                    ]
                                }
                            },
                            permission: {
                                create: {
                                    members: { connect: { snowflake: roles.guildMember }},
                                    teamMembers: { connect: { snowflake: roles.teamMember }},
                                    teamRepresentatives: { connect: { snowflake: roles.teamRepresentative }},
                                    teamCaptains: { connect: { snowflake: roles.teamCaptain }},

                                    read: { connect: { snowflake: roles.guildMember }},
                                    update: { connect: { snowflake: roles.managementCaptain }},
                                    createTeam: { connect: { snowflake: roles.managementMember }},
                                    createDivision: { connect: { snowflake: roles.managementMember }},
                                }
                            },
                            teams: {
                                create: {
                                    alias: 'management-team',
                                    name: 'Management Team',
                                    type: 'Management',
                                    capacity: null,
                                    division: {
                                        create: {
                                            guild: { connect: { snowflake: guildId }},
                                            name: guild.name,
                                            primary: true,
                                            permission: {
                                                create: {
                                                    read: { connect: { snowflake: roles.guildMember }},
                                                    update: { connect: { snowflake: roles.managementMember }},
                                                    delete: {}
                                                }
                                            }
                                        }
                                    },
                                    permission: {
                                        create: {
                                            members: { connect: { snowflake: roles.managementMember }},
                                            representatives: { connect: { snowflake: roles.managementRepresentative }},
                                            captains: { connect: { snowflake: roles.managementCaptain }},

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
                                            readTime: {}
                                        }
                                    }
                                }
                            }
                        },
                        select: {
                            id: true,
                            permission: {
                                select: {
                                    anyMemberRoleId: true,
                                    anyTeamMemberRoleId: true,
                                    anyTeamRepresentativeRoleId: true,
                                    anyTeamCaptainRoleId: true
                                }
                            },
                            teams: {
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
                        }
                    })

                    // establish parent/child relationships for the new roles
                    await client.roleChild.createMany({
                        data: [
                            { parentId: publicRole.id, childId: newGuild.permission!.anyMemberRoleId },
                            { parentId: newGuild.permission!.anyMemberRoleId, childId: newGuild.permission!.anyTeamMemberRoleId },
                            { parentId: newGuild.permission!.anyTeamMemberRoleId, childId: newGuild.permission!.anyTeamRepresentativeRoleId },
                            { parentId: newGuild.permission!.anyTeamRepresentativeRoleId, childId: newGuild.permission!.anyTeamCaptainRoleId },
                            { parentId: newGuild.permission!.anyTeamMemberRoleId, childId: newGuild.teams[0]!.permission!.memberRoleId },
                            { parentId: newGuild.permission!.anyTeamRepresentativeRoleId, childId: newGuild.teams[0]!.permission!.representativeRoleId },
                            { parentId: newGuild.permission!.anyTeamCaptainRoleId, childId: newGuild.teams[0]!.permission!.captainRoleId },
                            { parentId: newGuild.teams[0]!.permission!.memberRoleId, childId: newGuild.teams[0]!.permission!.representativeRoleId },
                            { parentId: newGuild.teams[0]!.permission!.representativeRoleId, childId: newGuild.teams[0]!.permission!.captainRoleId }
                        ]
                    })

                    // link the roles back to the team
                    await client.role.updateMany({
                        where: {
                            id: {
                                in: [
                                    newGuild.teams[0]!.permission!.memberRoleId,
                                    newGuild.teams[0]!.permission!.representativeRoleId,
                                    newGuild.teams[0]!.permission!.captainRoleId
                                ]
                            }
                        },
                        data: { teamId: newGuild.teams[0]!.id }
                    })

                    // now that the permission tables are set up, we can create the guild leader
                    await client.teamMember.create({
                        data: {
                            team: { connect: { id: newGuild.teams[0]!.id }},
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
                                                name: owner.user.username,
                                                discriminator: owner.user.discriminator,
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
