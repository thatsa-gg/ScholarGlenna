import { type Guild, Prisma } from '../../generated/client/index.js'
import { safeAlias, safeUsername, type SimpleAPIGuildMember } from '../index.js'

export const guildMemberExtension = Prisma.defineExtension((client) => client.$extends({
    model: {
        guildMember: {
            async findOrCreate(guild: Pick<Guild, 'id'>, member: SimpleAPIGuildMember){
                const snowflake = BigInt(member.user.id)
                return await client.guildMember.upsert({
                    where: { snowflake_guildId: { guildId: guild.id, snowflake }},
                    update: {},
                    create: {
                        snowflake,
                        name: member.nick,
                        icon: member.avatar,
                        guild: { connect: { id: guild.id }},
                        user: {
                            connectOrCreate: {
                                where: { snowflake },
                                create: {
                                    snowflake,
                                    name: safeUsername(member.user),
                                    alias: safeAlias(member.user),
                                    icon: member.user.avatar,
                                }
                            }
                        }
                    },
                    select: { id: true }
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
