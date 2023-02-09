import { z } from 'zod'
import { procedure, scalarOrArray } from '../../../trpc.js'
import { database } from "../../../database.js"
import { Boss, LogDifficultyType, TeamFocus, TeamLevel, TeamRegion } from '@glenna/prisma'

const commonProperties = z.object({
    boss: scalarOrArray(z.nativeEnum(Boss)).optional(),
    difficulty: scalarOrArray(z.nativeEnum(LogDifficultyType)).default([ 'NormalMode', 'ChallengeMode' ]),
    success: z.boolean().optional().default(true),
    after: z.date().optional(),
    before: z.date().optional(),
    limit: z.number().min(1).max(1000).default(1),
    skip: z.number().min(0).optional()
})

const withTeamFilters = commonProperties.extend({
    team: z.object({
        focus: z.nativeEnum(TeamFocus),
        level: z.nativeEnum(TeamLevel),
        region: z.nativeEnum(TeamRegion),
    }).partial().optional()
})

export const findProcedure = procedure
    .input(z.union([
        withTeamFilters,
        withTeamFilters.extend({ guild: scalarOrArray(database.guild.validateSnowflake('guild')) }),
        withTeamFilters.extend({ division: scalarOrArray(database.division.validateSnowflake('division')) }),
        commonProperties.extend({ team: scalarOrArray(database.team.validateSnowflake('team')) })
    ]))
    .query(async ({ input }) => {
        const logs = await database.log.findMany({
            where: {
                success: input.success,
                boss: Array.isArray(input.boss) ? { in: input.boss } : input.boss,
                difficulty: Array.isArray(input.difficulty) ? { in: input.difficulty } : input.difficulty,
                team: Array.isArray(input.team) ? { snowflake: { in: input.team }}
                    : typeof input.team === 'bigint' ? { snowflake: input.team }
                    : input.team ? input.team
                    : 'guild' in input ? { guild: { snowflake: Array.isArray(input.guild) ? { in: input.guild } : input.guild }}
                    : 'division' in input ? { divisions: { some: { division: { snowflake: Array.isArray(input.division) ? { in: input.division } : input.division }}}}
                    : undefined,
                startAt: {
                    gte: input.after,
                    lt: input.before
                }
            },
            take: input.limit,
            skip: input.skip,
            orderBy: {
                duration: 'asc'
            },
            distinct: [ 'boss', 'difficulty' ],
            select: {
                id: true,
                url: true,
                boss: true,
                success: true,
                difficulty: true,
                emboldenedLevel: true,
                duration: true,
                startAt: true,
                submittedAt: true,
                team: {
                    select: {
                        snowflake: true,
                        name: true
                    }
                }
            }
        })
        return logs
    })
