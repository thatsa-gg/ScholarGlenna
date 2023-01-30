import { Prisma } from '../../generated/client/index.js'

export const correlationExtension = Prisma.defineExtension(client => client.$extends({
    client: {
        correlate(){
        }
    }
}))
