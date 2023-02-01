import { Prisma } from '../../generated/client/index.js'
import type { Guild } from '@glenna/discord'

export const guildExtension = Prisma.defineExtension(client => client.$extends({
    model: {
        guild: {
            async import(guild: Guild){
                const owner = await guild.fetchOwner()
                const guildId = BigInt(guild.id)
                const ownerId = BigInt(owner.id)
                const guildAlias = guild.vanityURLCode && await client.guild.findUnique({ where: { alias: guild.vanityURLCode }})
                    ? guild.vanityURLCode
                    : guildId.toString(36)
                const guildData = await client.guild.create({
                    data: {
                        name: guild.name,
                        snowflake: guildId,
                        alias: guildAlias,
                        teams: {
                            create: {
                                snowflake: guildId,
                                alias: 'management-team',
                                name: 'Management Team',
                                type: 'Management',
                            }
                        },
                        members: {
                            create: {
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
                                }
                            }
                        }
                    },
                    select: {
                        id: true,
                        teams: { select: { id: true }},
                        members: { select: { id: true }}
                    }
                })
                await client.teamMember.create({
                    data: {
                        role: 'Captain',
                        team: { connect: guildData.teams[0]! },
                        member: { connect: guildData.members[0]! }
                    }
                })
            }
        }
    }
}))
