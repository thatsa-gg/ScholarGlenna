import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from "../../database.js"
import { stringifySnowflake } from '@glenna/prisma'

export const findProcedure = procedure
    .input(z.union([
        z.object({ name: z.string() }),
        z.object({ alias: z.string() }),
        z.undefined()
    ]))
    .query(async ({ input }) => {
        const guilds = await database.guild.findMany({
            where: {
                name: input && 'name' in input ? input.name : undefined,
                alias: input && 'alias' in input ? input.alias : undefined
            },
            select: {
                snowflake: true,
                name: true,
            }
        })
        return guilds.map(stringifySnowflake)
    })
