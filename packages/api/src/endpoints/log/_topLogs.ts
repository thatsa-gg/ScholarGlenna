import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from "../../database.js"
import { Boss, stringifySnowflake } from '@glenna/prisma'

export const topLogsProcedure = procedure
    .input(z.object({
        boss: z.nativeEnum(Boss),
        division: database.division.validateSnowflake('division').optional()
    }))
    .query(async ({ input: { boss, division: snowflake }}) => {
        const logs = await database.log.findMany({
            where: {
                boss: boss,
                success: true,
                difficulty: { not: 'Emboldened' },
                team: { divisions: { some: { division: { snowflake }}}}
            },
            orderBy: { duration: 'asc' },
            distinct: [ 'boss', 'difficulty' ],
            select: {
                url: true,
                boss: true,
                difficulty: true,
                duration: true,
                team: {
                    select: {
                        snowflake: true,
                        name: true
                    }
                }
            }
        })
        return logs.map(({ team, ...props }) => ({
            ...props,
            team: stringifySnowflake(team)
        }))
    })
