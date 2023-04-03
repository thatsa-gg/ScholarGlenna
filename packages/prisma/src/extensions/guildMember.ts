import { type Guild, Prisma } from '../../generated/client/index.js'
import type { GuildMember } from '@glenna/discord'

export const guildMemberExtension = Prisma.defineExtension((client) => client.$extends({
    model: {
        guildMember: {
            findOrCreate(guild: Pick<Guild, 'id'>, member: GuildMember){
                const snowflake = BigInt(member.user.id)
                return client.guildMember.upsert({
                    where: {
                        snowflake_guildId: {
                            guildId: guild.id,
                            snowflake
                        }
                    },
                    update: {},
                    create: {
                        snowflake,
                        name: member.nickname,
                        icon: member.avatar,
                        guild: { connect: { id: guild.id }},
                        user: {
                            connectOrCreate: {
                                where: { snowflake },
                                create: {
                                    snowflake,
                                    name: member.user.username,
                                    icon: member.user.avatar,
                                    discriminator: member.user.discriminator
                                }
                            }
                        }
                    },
                    select: {
                        id: true
                    }
                })
            }
        }
    },
    result: {
        guildMember: {
            mention: {
                needs: { snowflake: true },
                compute({ snowflake }){
                    return `<@${snowflake}>`
                }
            }
        }
    }
}))
