import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from "../../database.js"

export const topLogsProcedure = procedure
    .input(z.object({
        teamSnowflake: database.team.validateSnowflake('teamSnowflake')
    }))
    .query(async ({ input: { teamSnowflake: snowflake }}) => {
        const logs = await database.log.findMany({
            where: {
                team: { snowflake },
                success: true,
                difficulty: { not: 'Emboldened' }
            },
            orderBy: { duration: 'asc' },
            distinct: [ 'boss', 'difficulty' ],
            select: {
                url: true,
                boss: true,
                difficulty: true,
                duration: true,
            }
        })
        return logs
    })
