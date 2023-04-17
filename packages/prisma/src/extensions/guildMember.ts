import { type Guild, Prisma } from '../../generated/client/index.js'
import type { GuildMember } from '@glenna/discord'

export const guildMemberExtension = Prisma.defineExtension((client) => client.$extends({
    model: {
        guildMember: {
            async findOrCreate(guild: Pick<Guild, 'id'>, member: GuildMember){
                const snowflake = BigInt(member.user.id)
                const publicRole = await client.role.findFirstOrThrow({ where: { type: 'Public' }, select: { id: true }})
                const guildRoles = await client.guildPermission.findUniqueOrThrow({ where: { guildId: guild.id }, select: { anyMemberRoleId: true }})
                // TODO: roles, or investigate using triggers for role management
                return await client.guildMember.upsert({
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
                                    discriminator: member.user.discriminator,
                                    roles: { connect: publicRole }
                                }
                            }
                        },
                        roles: {
                            create: {
                                role: { connect: { id: guildRoles.anyMemberRoleId } },
                                user: { connect: { snowflake }}
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
