import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from "../../database.js"
import { stringifySnowflake } from '@glenna/prisma'

export const findProcedure = procedure
    .input(z.object({
        guild: database.guild.validateSnowflake('guild')
    }))
    .query(async ({ input: { guild: snowflake }}) => {
        const divisions = await database.division.findMany({
            where: { guild: { snowflake }},
            select: {
                name: true,
                snowflake: true
            }
        })
        return divisions.map(stringifySnowflake)
    })
