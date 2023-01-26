import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { Database, type Team, type Prisma } from '@glenna/prisma'

export const teamsProcedure = procedure
    .input(z.object({ guildSnowflake: z.string() }))
    .query(async ({ input: { guildSnowflake }}) => {
        const guild = await Database.singleton().guild.findUniqueOrThrow({
            where: { snowflake: BigInt(guildSnowflake) },
            select: {
                teams: {
                    select: {
                        snowflake: true,
                        name: true
                    }
                }
            }
        })
        return guild.teams.map(({ snowflake, name }) => ({
            name,
            snowflake: snowflake.toString()
        }))
    })
