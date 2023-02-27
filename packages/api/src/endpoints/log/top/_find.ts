import { z } from 'zod'
import { procedure, scalarOrArray } from '../../../trpc.js'
import { database } from "../../../database.js"
import { Boss, LogDifficultyType, Prisma, stringifySnowflake, TeamFocus, TeamLevel, TeamRegion } from '@glenna/prisma'

const commonProperties = z.object({
    boss: scalarOrArray(z.nativeEnum(Boss)).optional(),
    difficulty: scalarOrArray(z.nativeEnum(LogDifficultyType)).default([ 'NormalMode', 'ChallengeMode' ]),
    success: z.boolean().optional().default(true),
    after: z.date().optional(),
    before: z.date().optional(),
    limit: z.number().min(1).max(1000).default(1),
    skip: z.number().min(0).default(0)
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
                    : 'guild' in input ? { ...input.team, guild: { snowflake: Array.isArray(input.guild) ? { in: input.guild } : input.guild }}
                    : 'division' in input ? { ...input.team, division: { snowflake: Array.isArray(input.division) ? { in: input.division } : input.division }}
                    : input.team,
                startAt: {
                    gte: input.after,
                    lt: input.before
                }
            },
            orderBy: [
                { success: 'asc' },
                { difficulty: 'asc' },
                { emboldenedLevel: 'asc' },
                { duration: 'asc' },
            ],
            distinct: [ 'teamId', 'boss', 'difficulty' ],
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

        // weird types so we can stable-sort remove any extra teams with the same ordering as the initial query
        const buckets = new Map<`${Boss}${LogDifficultyType}`, [teams: Set<bigint>, logs: typeof logs]>();
        for(const log of logs){
            const encounter = `${log.boss}${log.difficulty}` as const
            const [ teams, logs ] = buckets.get(encounter) ?? buckets.set(encounter, [new Set(), []]).get(encounter)!
            if(!teams.has(log.team.snowflake)){
                teams.add(log.team.snowflake)
                logs.push(log)
            }
        }

        // *hurk*
        return Object.fromEntries(Array.from(buckets.entries(), ([ encounter, [, logs] ]) => [
            encounter,
            logs.slice(input.skip, input.skip + input.limit).map(log => ({
                ...log,
                team: stringifySnowflake(log.team)
            }))
        ]))
    })
