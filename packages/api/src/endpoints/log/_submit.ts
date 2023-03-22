import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from '../../database.js'
import { cache } from '../../cache.js'
import { Boss, isTriggerId, LogDifficultyType, triggerIDToBoss } from '@glenna/prisma'
import { Cache } from '@glenna/cache'
import type { Team, Prisma } from '@glenna/prisma'

function parseDateString(date: string): Date {
    // EI returns strings like "YYYY-MM-DD HH:mm:ss +-TZ",
    // but JS only understands "YYYY-MM-DD\THH:mm:ss+-TZ"
    return new Date(date.replace(/^(\d\d\d\d-\d\d-\d\d)\s+(\d\d?:\d\d:\d\d)\s+/, '$1T$2'))
}

type RefinedTeamOutput = Pick<Prisma.LogCreateManyInput, 'difficulty' | 'emboldenedLevel' | 'success' | 'duration' | 'startAt' | 'boss'>
const wingmanMetadata = z.object({
    triggerID: z.number().refine(isTriggerId, trigger => ({ message: `Unrecognized Boss ID ${trigger}` })).transform(triggerIDToBoss),
    success: z.boolean(),
    durationMS: z.number().int(),
    timeStart: z.string().transform(parseDateString),
    emboldened: z.number().optional().default(0),
    isCM: z.boolean()
}).transform<RefinedTeamOutput>(data => ({
    difficulty: data.emboldened > 0 ? 'Emboldened' : data.isCM ? 'ChallengeMode' : 'NormalMode',
    emboldenedLevel: data.emboldened,
    success: data.success,
    duration: data.durationMS,
    startAt: data.timeStart,
    boss: data.triggerID
}))

const arcdpsLogData = z.object({
    triggerID: z.number().refine(isTriggerId, trigger => ({ message: `Unrecognized Boss ID ${trigger}` })).transform(triggerIDToBoss),
    success: z.boolean(),
    durationMS: z.number().int(),
    timeStartStd: z.string().transform(parseDateString),
    isCM: z.boolean(),
    presentInstanceBuffs: z.tuple([ z.number().int(), z.number().int() ]).array().optional().default([])
        .transform(buffs => new Map<number, number>(buffs))
}).transform<RefinedTeamOutput>(data => {
    const emboldenedLevel = data.presentInstanceBuffs.get(68087) || 0
    return {
        difficulty: emboldenedLevel > 0 ? 'Emboldened' : data.isCM ? 'ChallengeMode' : 'NormalMode',
        emboldenedLevel,
        success: data.success,
        duration: data.durationMS,
        startAt: data.timeStartStd,
        boss: data.triggerID
    }
})

async function loadReportData(team: Pick<Team, 'id'>, url: URL): Promise<Prisma.LogCreateManyInput> {
    const source = url.host === 'dps.report'
        ? new URL(`https://dps.report/getJson?permalink=${url.pathname.slice(1)}`)
        : new URL(`https://gw2wingman.nevermindcreations.de/api/getMetadata/${url.pathname.replace(/^\/log\//, '')}`)
    const parser = url.host === 'dps.report'
        ? arcdpsLogData
        : wingmanMetadata
    const data = await Cache.fetch<RefinedTeamOutput>(cache.client, source, {
        async parse(response){
            return parser.parse(await response.json())
        },
        hydrate(object){
            return z.object({
                difficulty: z.nativeEnum(LogDifficultyType),
                emboldenedLevel: z.number().int(),
                success: z.boolean(),
                duration: z.number().int(),
                boss: z.nativeEnum(Boss),
                startAt: z.date()
            }).parse(object)
        }
    })
    return {
        url: url.toString(),
        teamId: team.id,
        submittedAt: new Date(),
        ...data
    }
}

export const submitProcedure = procedure
    .input(z.object({
        team: database.team.fetch('team', { id: true }),
        logs: z.array(z
            .string()
            .regex(/^(?:https:\/\/)?(?:dps\.report\/[a-zA-Z0-9_-]+|gw2wingman\.nevermindcreations\.de\/log\/[a-zA-Z0-9_-]+)$/))
    }))
    .output(z.object({
        created: z.number().int()
    }))
    .mutation(async ({ input: { team, logs } }) => {
        const data = await Promise.all(logs
            .map(url => new URL(url.startsWith('https://') ? url : `https://${url}`))
            .map(url => loadReportData(team, url)))
        // TODO: log players.
        const batch = await database.log.createMany({ data, skipDuplicates: true })
        return {
            created: batch.count
        }
    })
