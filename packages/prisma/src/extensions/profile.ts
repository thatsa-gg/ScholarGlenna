import { Prisma } from '../../generated/client/index.js'
import type { APIUser } from '@glenna/discord'

export const profileExtension = Prisma.defineExtension(client => client.$extends({
    model: {
        profile: {
            async import(user: APIUser) {
                const snowflake = BigInt(user.id)
                return await client.profile.upsert({
                    where: { snowflake },
                    select: { id: true, snowflake: true },
                    create: {
                        snowflake,
                        user: {
                            connectOrCreate: {
                                where: { snowflake },
                                create: {
                                    snowflake,
                                    discriminator: user.discriminator,
                                    name: user.username,
                                    icon: user.avatar
                                }
                            }
                        }
                    },
                    update: {
                        user: {
                            update: {
                                name: user.username,
                                discriminator: user.discriminator,
                                icon: user.avatar,
                            }
                        }
                    }
                })
            }
        }
    }
}))
