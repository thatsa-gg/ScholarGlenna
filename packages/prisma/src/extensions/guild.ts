import { Prisma } from '../../generated/client/index.js'

export const guildExtension = Prisma.defineExtension(client => client.$extends({
    model: {
        guild: {
        }
    },
    query: {
        guild: {

        }
    }
}))
