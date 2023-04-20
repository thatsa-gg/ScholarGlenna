import { Prisma, type PrismaClient } from '../../generated/client/index.js'
import { z } from 'zod'

export async function snowflakes<T extends string>(client: Pick<PrismaClient, '$queryRawUnsafe'>, ...keys: [T, ...T[]]): Promise<{ [k in T]: bigint }> {
    return z.object(Object.assign({}, ...keys.map(k => ({
        [k]: z.bigint()
    })))).array().length(1).parse(await client.$queryRawUnsafe(`select ${
        keys.map(k => `new_snowflake() as "${k}"`).join(`,`)
    }`))[0]! as { [k in T]: bigint }
}

export const clientExtension = Prisma.defineExtension(client => client.$extends({
    client: {
        snowflakes<T extends string>(...keys: [T, ...T[]]): Promise<{ [k in T]: bigint }> {
            return snowflakes(client, ...keys)
        }
    }
}))
