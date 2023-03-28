import { z } from 'zod'
import { procedure, scalarOrArray } from '../../trpc.js'
import { database } from "../../database.js"
import { Boss, LogDifficultyType, stringifySnowflake, TeamFocus, TeamLevel, TeamRegion } from '@glenna/prisma'

const sortOrder = z.enum([ 'asc', 'desc' ])
const commonProperties = z.object({
    boss: scalarOrArray(z.nativeEnum(Boss)).optional(),
    difficulty: scalarOrArray(z.nativeEnum(LogDifficultyType)).default([ 'NormalMode', 'ChallengeMode' ]),
    emboldenedLevel: z.number().int().min(0).max(5).optional(),
    success: z.boolean().nullable().optional(),
    date: z.union([
        z.date(),
        z.object({
            lt: z.date().optional(),
            lte: z.date().optional(),
            gt: z.date().optional(),
            gte: z.date().optional()
        })
    ]).optional(),
    submitted: z.union([
        z.date(),
        z.object({
            lt: z.date().optional(),
            lte: z.date().optional(),
            gt: z.date().optional(),
            gte: z.date().optional()
        })
    ]).optional(),
    sort: z.union([
        z.literal('top'),
        scalarOrArray(z.union([
            z.enum([ 'date', 'difficulty', 'submitted', 'emboldened', 'duration' ]),
            z.object({ date: sortOrder }),
            z.object({ submitted: sortOrder }),
            z.object({ difficulty: sortOrder }),
            z.object({ duration: sortOrder }),
            z.object({ emboldened: sortOrder })
        ]))
    ]).default([
        { difficulty: 'desc' },
        { emboldened: 'asc' },
        { duration: 'asc' },
        { date: 'desc' }
    ]),
    limit: z.number().min(1).max(1000).default(20),
    offset: z.number().min(0).optional().default(0),
})

const sortKeyAlias = {
    date: 'startAt',
    difficulty: 'difficulty',
    duration: 'duration',
    emboldened: 'emboldenedLevel',
    submitted: 'submittedAt',
}
const sortKeys = Object.keys(sortKeyAlias) as (keyof typeof sortKeyAlias)[]

const defaultSortOrder = {
    date: 'desc',
    difficulty: 'desc',
    duration: 'asc',
    emboldened: 'asc',
    submitted: 'desc',
}

const teamFilter = {
    team: z.object({
        focus: z.nativeEnum(TeamFocus),
        level: z.nativeEnum(TeamLevel),
        region: z.nativeEnum(TeamRegion),
    }).partial().optional()
}

function asArray<T>(a: T | T[]){
    if(Array.isArray(a))
        return a
    return [ a ]
}

const logOutput = z.object({
    id: z.number(),
    url: z.string(),
    boss: z.nativeEnum(Boss),
    success: z.boolean(),
    difficulty: z.nativeEnum(LogDifficultyType),
    emboldenedLevel: z.number().int().min(0).max(5),
    duration: z.number().int().positive(),
    startAt: z.date(),
    submittedAt: z.date(),
    team: z.object({
        name: z.string(),
        snowflake: z.string()
    })
})

type Encounter = `${Boss}${LogDifficultyType}`
export const findProcedure = procedure
    .input(z.union([
        commonProperties.extend({ team: scalarOrArray(database.team.validateSnowflake('team')) }),
        commonProperties.extend(teamFilter).extend({ guild: scalarOrArray(database.guild.validateSnowflake('guild')) }),
        commonProperties.extend(teamFilter).extend({ division: scalarOrArray(database.division.validateSnowflake('division')) }),

        // this *must* go last, since otherwise the input makes it through here and guild/division validation doesn't happen
        commonProperties.extend(teamFilter),
    ]))
    .query(async ({ input }) => {
        const logs = await database.log.findMany({
            where: {
                success: input.success === null ? undefined : input.success ?? true,
                boss: Array.isArray(input.boss) ? { in: input.boss } : input.boss,
                difficulty: Array.isArray(input.difficulty) ? { in: input.difficulty } : input.difficulty,
                team: Array.isArray(input.team) ? { snowflake: { in: input.team }}
                    : typeof input.team === 'bigint' ? { snowflake: input.team }
                    : 'guild' in input ? { ...input.team, guild: { snowflake: Array.isArray(input.guild) ? { in: input.guild } : input.guild }}
                    : 'division' in input ? { ...input.team, division: { snowflake: Array.isArray(input.division) ? { in: input.division } : input.division }}
                    : input.team,
                startAt: input.date,
                submittedAt: input.submitted
            },
            // sorting by top needs to be done client-side
            take: input.sort === 'top' ? undefined : input.limit,
            skip: input.sort === 'top' ? undefined : input.offset,
            orderBy: input.sort === 'top' ? [
                { difficulty: 'desc' },
                { emboldenedLevel: 'asc' },
                { duration: 'asc' },
                { startAt: 'desc' }
            ] : asArray(input.sort).map(entry => {
                if(typeof entry === 'string')
                    return { [sortKeyAlias[entry]]: defaultSortOrder[entry] }
                for(const key of sortKeys)
                    if(key in entry)
                        return { [sortKeyAlias[key]]: (entry as any)[key] as 'asc' | 'desc' }
                throw `Could not map sort object.`
            }),
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

        if(input.sort === 'top'){
            // weird types so we can stable-sort remove any extra teams with the same ordering as the initial query
            const buckets = new Map<Encounter, [teams: Set<bigint>, logs: typeof logs]>();
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
                logs.slice(input.offset, input.offset + input.limit).map(log => ({
                    ...log,
                    team: stringifySnowflake(log.team)
                }))
            ])) as {[prop in Encounter]?: z.infer<typeof logOutput>[] }
        }

        // normally-sortd query, just dump out the results
        return logs.map(log => ({
            ...log,
            team: stringifySnowflake(log.team)
        }))
    })
