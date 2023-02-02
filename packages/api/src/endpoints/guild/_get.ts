import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from "../../database.js"
import { stringifySnowflake } from '@glenna/prisma'

export const getProcedure = procedure
    .input(z.object({
        guildSnowflake: database.guild.validateSnowflake('guildSnowflake').optional()
    }))
    .query(async ({ input: { guildSnowflake: snowflake }}) => {
        const guilds = await database.guild.findMany({
            where: { snowflake },
            select: {
                id: true,
                snowflake: true,
                name: true,
            }
        })
        return guilds.map(stringifySnowflake)
    })
