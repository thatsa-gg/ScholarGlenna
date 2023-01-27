import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from "../../database.js"
import { stringifySnowflake } from '@glenna/prisma'

export const divisionsProcedure = procedure
    .input(z.object({
        guildSnowflake: database.guild.validateSnowflake('guildSnowflake')
    }))
    .query(async ({ input: { guildSnowflake: snowflake }}) => {
        const divisions = await database.division.findMany({
            where: { guild: { snowflake }},
            select: {
                name: true,
                snowflake: true
            }
        })
        return divisions.map(stringifySnowflake)
    })
