import { Prisma, RoleType, type Role } from '../../generated/client/index.js'
import { type Guild } from '@glenna/discord'

export const guildExtension = Prisma.defineExtension(client => client.$extends({
    model: {
        guild: {
            async import(guild: Guild){
                const owner = await guild.fetchOwner()
                const guildId = BigInt(guild.id)
                const ownerId = BigInt(owner.id)
                client.$transaction(async client => {
                    const guildAlias = guild.vanityURLCode && await client.guild.findUnique({ where: { alias: guild.vanityURLCode }})
                        ? guild.vanityURLCode
                        : guildId.toString(36)
                    const connect = await client.guild.create({
                        data: {
                            name: guild.name,
                            snowflake: guildId,
                            alias: guildAlias,
                            acronym: guild.nameAcronym,
                            icon: guild.icon,
                        },
                        select: { id: true }
                    })

                    const publicRole = await client.role.findFirstOrThrow({ where: { type: 'Public' }, select: { id: true }})
                    const createRole = (type: RoleType, ...parents: Pick<Role, 'id'>[]) =>
                        client.role.create({
                            data: {
                                type, guild: { connect },
                                parent: { createMany: { data: parents.map(({ id }) => ({ parentId: id }))}}
                            },
                            select: { id: true }
                        })
                    const anyGuildMemberRole = await createRole('AnyGuildMember', publicRole)
                    const anyTeamMemberRole = await createRole('AnyTeamMember', anyGuildMemberRole)
                    const anyTeamRepresentativeRole = await createRole('AnyTeamRepresentative', anyTeamMemberRole)
                    const anyTeamCaptainRole = await createRole('AnyTeamCaptain', anyTeamRepresentativeRole)
                    const managementTeamMemberRole = await createRole('TeamMember', anyTeamMemberRole)
                    const managementTeamRepresentativeRole = await createRole('TeamRepresentative', managementTeamMemberRole, anyTeamRepresentativeRole)
                    const managementTeamCaptainRole = await createRole('TeamCaptain', managementTeamRepresentativeRole, anyTeamCaptainRole)

                    await client.guildPermission.create({
                        data: {
                            guild: { connect },
                            read: { connect: anyGuildMemberRole },
                            update: { connect: managementTeamCaptainRole },
                            createTeam: { connect: managementTeamMemberRole },
                            createDivision: { connect: managementTeamMemberRole }
                        }
                    })

                    const ownerUser = await client.user.upsert({
                        where: { snowflake: ownerId },
                        update: {},
                        create: {
                            snowflake: ownerId,
                            name: owner.user.username,
                            discriminator: owner.user.discriminator,
                            icon: owner.user.avatar,
                            roles: { create: { role: { connect: publicRole }}}
                        },
                        select: { id: true }
                    })

                    const ownerMember = await client.guildMember.create({
                        data: {
                            guild: { connect },
                            snowflake: ownerId,
                            name: owner.nickname,
                            icon: owner.avatar,
                            user: { connect: ownerUser },
                            roles: {
                                create: {
                                    role: { connect: anyGuildMemberRole },
                                    user: { connect: ownerUser }
                                }
                            }
                        },
                        select: { id: true }
                    })

                    const managementTeam = await client.team.create({
                        data: {
                            guild: { connect },
                            alias: 'management-team',
                            name: 'Management Team',
                            type: 'Management',
                            capacity: null,
                            division: {
                                create: {
                                    guild: { connect },
                                    name: guild.name,
                                    primary: true,
                                    permission: {
                                        create: {
                                            read: { connect: anyGuildMemberRole },
                                            update: { connect: managementTeamMemberRole },
                                            delete: { connect: managementTeamMemberRole }
                                        }
                                    }
                                }
                            },
                            permission: {
                                create: {
                                    read: { connect: anyGuildMemberRole },
                                    update: { connect: managementTeamCaptainRole },
                                    delete: {},

                                    updateDivision: {},
                                    updateRole: { connect: managementTeamCaptainRole },

                                    createMember: { connect: managementTeamCaptainRole },
                                    updateMember: { connect: managementTeamCaptainRole },
                                    deleteMember: { connect: managementTeamCaptainRole },
                                    readMember: { connect: anyGuildMemberRole },

                                    createTime: {},
                                    updateTime: {},
                                    deleteTime: {},
                                    readTime: {}
                                }
                            },
                            members: {
                                create: {
                                    role: 'Captain',
                                    member: { connect: { id: ownerMember.id }}
                                }
                            }
                        },
                        select: {
                            id: true
                        }
                    })

                    await client.role.update({ where: managementTeamMemberRole, data: { team: { connect: managementTeam }}})
                    await client.role.update({ where: managementTeamRepresentativeRole, data: { team: { connect: managementTeam }}})
                    await client.role.update({ where: managementTeamCaptainRole, data: { team: { connect: managementTeam }}})

                    await client.roleMember.create({
                        data: {
                            role: { connect: managementTeamCaptainRole },
                            user: { connect: ownerUser },
                            guildMember: { connect: ownerMember }
                        }
                    })
                })
            }
        }
    }
}))
