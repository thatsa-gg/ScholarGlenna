import { Prisma } from '../../generated/client/index.js'

export const userExtension = Prisma.defineExtension(client => client.$extends({
    model: {
        user: {
            prune(){
                return client.user.deleteMany({
                    where: {
                        guildMemberships: { none: {}},
                        profile: null
                    }
                })
            }
        }
    }
}))
