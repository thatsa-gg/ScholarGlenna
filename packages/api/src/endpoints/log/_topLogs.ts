import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from "../../database.js"
import { Boss, stringifySnowflake } from '@glenna/prisma'

export const topLogsProcedure = procedure
    .input(z.object({
        boss: z.nativeEnum(Boss),
        division: database.division.validateSnowflake('division').optional(),
        limit: z.number()
            .refine(a => Number.isSafeInteger(a), { message: 'Limit must be a safe integer >= 1.' })
            .refine(a => a >= 1, { message: 'Limit must be a safe integer >= 1' })
            .default(10),
        skip: z.number()
            .refine(a => Number.isSafeInteger(a), { message: 'Skip must be a safe integer >= 0.' })
            .refine(a => a >= 0, { message: 'Skip must be a safe integer >= 0' })
            .default(0)
    }))
    .query(async ({ input: { boss, division: snowflake, limit: take, skip }}) => {
        const logs = await database.log.findMany({
            where: {
                boss: boss,
                success: true,
                difficulty: { not: 'Emboldened' },
                team: { divisions: { some: { division: { snowflake }}}}
            },
            orderBy: { duration: 'asc' },
            distinct: [ 'boss', 'difficulty' ],
            take, skip,
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
