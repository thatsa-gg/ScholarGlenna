import { Prisma } from '../../generated/client/index.js'
import { z } from 'zod'

export const clientExtension = Prisma.defineExtension(client => client.$extends({
    client: {
        async snowflakes<T extends string>(...keys: [T, ...T[]]): Promise<{ [k in T]: bigint }> {
            return z.object(Object.assign({}, ...keys.map(k => ({
                [k]: z.bigint()
            })))).array().length(1).parse(await client.$queryRawUnsafe(`select ${
                keys.map(k => `new_snowflake() as "${k}"`).join(`,`)
            }`))[0]! as { [k in T]: bigint }
        }
    }
}))
