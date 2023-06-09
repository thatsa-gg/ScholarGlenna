import { Prisma } from '../../generated/client/index.js'
import type { APIUser } from '@glenna/discord'
import { safeUsername } from '../index.js'

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
                                    name: safeUsername(user),
                                    icon: user.avatar
                                }
                            }
                        }
                    },
                    update: {
                        user: {
                            update: {
                                name: safeUsername(user),
                                icon: user.avatar,
                            }
                        }
                    }
                })
            }
        }
    }
}))
