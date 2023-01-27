import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from "../../database.js"
import { stringifySnowflake } from '@glenna/prisma'

export const teamsProcedure = procedure
    .input(z.object({
        guildSnowflake: database.guild.validateSnowflake('guildSnowflake')
    }))
    .query(async ({ input: { guildSnowflake: snowflake }}) => {
        const teams = await database.team.findMany({
            where: { guild: { snowflake }},
            select: {
                snowflake: true,
                name: true
            }
        })
        return teams.map(stringifySnowflake)
    })
