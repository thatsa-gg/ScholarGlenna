import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from "../../database.js"
import { stringifySnowflake, TeamType } from '@glenna/prisma'

export const teamsProcedure = procedure
    .input(z.object({
        guildSnowflake: database.guild.validateSnowflake('guildSnowflake'),
        type: z.array(z.nativeEnum(TeamType)).default([ 'Normal' ])
    }))
    .query(async ({ input: { guildSnowflake: snowflake, type }}) => {
        const teams = await database.team.findMany({
            where: {
                guild: { snowflake },
                type: { in: type }
            },
            select: {
                snowflake: true,
                name: true
            }
        })
        return teams.map(stringifySnowflake)
    })
