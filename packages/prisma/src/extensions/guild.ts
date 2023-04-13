import { Prisma } from '../../generated/client/index.js'
import type { Guild } from '@glenna/discord'

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
                    await client.guild.create({
                        data: {
                            name: guild.name,
                            snowflake: guildId,
                            alias: guildAlias,
                            acronym: guild.nameAcronym,
                            icon: guild.icon,
                            permission: { create: {} },
                            divisions: {
                                create: {
                                    name: guild.name,
                                    snowflake: guildId,
                                    primary: true,
                                    permission: { create: {} }
                                }
                            },
                            teams: {
                                create: {
                                    snowflake: guildId,
                                    alias: 'management-team',
                                    name: 'Management Team',
                                    type: 'Management',
                                    capacity: null,
                                    division: { connect: { snowflake: guildId }},
                                    permission: {
                                        create: {
                                            update: 'GuildCaptain',
                                            delete: 'None',
                                            updateDivision: 'None',

                                            updateRole: 'GuildCaptain',
                                            createMember: 'GuildCaptain',
                                            updateMember: 'GuildCaptain',
                                            deleteMember: 'GuildCaptain',

                                            createTime: 'None',
                                            updateTime: 'None',
                                            deleteTime: 'None',
                                            readTime: 'None',
                                        }
                                    }
                                }
                            },
                            members: {
                                create: {
                                    snowflake: ownerId,
                                    name: owner.nickname,
                                    icon: owner.avatar,
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
                                    },
                                    teamMemberships: {
                                        create: {
                                            team: { connect: { snowflake: guildId }},
                                            role: 'Captain'
                                        }
                                    }
                                }
                            }
                        },
                        select: {
                            id: true,
                            divisions: { select: { id: true }},
                            teams: { select: { id: true }},
                            members: { select: { id: true }}
                        }
                    })
                })
            }
        }
    }
}))
