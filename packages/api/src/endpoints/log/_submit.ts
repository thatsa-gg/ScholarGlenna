import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { Database, type Team, type Prisma } from '@glenna/prisma'

function parseDateString(date: string): Date {
    // EI returns strings like "YYYY-MM-DD HH:mm:ss +-TZ",
    // but JS only understands "YYYY-MM-DD\THH:mm:ss+-TZ"
    return new Date(date.replace(/^(\d\d\d\d-\d\d-\d\d)\s+(\d\d?:\d\d:\d\d)\s+/, '$1T$2'))
}

async function loadDPSReportData(team: Pick<Team, 'id'>, url: URL): Promise<Prisma.LogCreateManyInput> {
    const response = await fetch(`https://dps.report/getJson?permalink=${url.pathname.slice(1)}`)
    const data = await response.json()
    const boss = Database.triggerIDToBoss(data.triggerID as number)
    if(null === boss)
        throw `Unrecognized Boss ID ${boss}`
    return {
        url: url.toString(),
        difficulty: data.emboldened > 0 ? 'Emboldened' : data.isCM ? 'ChallengeMode' : 'NormalMode', // TODO: fix emboldened detection
        success: data.success as boolean,
        duration: data.durationMS as number,
        teamId: team.id,
        submittedAt: new Date(),
        startAt: parseDateString(data.timeStartStd as string),
        boss: boss
    }
}

async function loadWingmanData(team: Pick<Team, 'id'>, url: URL): Promise<Prisma.LogCreateManyInput> {
    const response = await fetch(`https://gw2wingman.nevermindcreations.de/api/getMetadata/${url.pathname.replace(/^\/log\//, '')}`)
    const data = await response.json()
    const boss = Database.triggerIDToBoss(data.triggerID as number)
    if(null === boss)
        throw `Unrecognized Boss ID ${boss}`
    return {
        url: url.toString(),
        difficulty: data.emboldened > 0 ? 'Emboldened' : data.isCM ? 'ChallengeMode' : 'NormalMode',
        success: data.success as boolean,
        duration: data.durationMS as number,
        teamId: team.id,
        submittedAt: new Date(),
        startAt: parseDateString(data.timeStart as string),
        boss: boss
    }
}

export const submitProcedure = procedure
    .input(z.object({
        teamSnowflake: z.string(),
        logs: z.array(z
            .string()
            .regex(/^(?:https:\/\/)?(?:dps\.report\/[a-zA-Z0-9_-]+|gw2wingman\.nevermindcreations\.de\/log\/[a-ZA-Z0-9_-]+)$/))
    }))
    .mutation(async ({ input: { teamSnowflake, logs } }) => {
        const team = await Database.singleton().team.findUniqueOrThrow({ where: { snowflake: BigInt(teamSnowflake) }, select: { id: true }})
        const data = await Promise.all(logs
            .map(url => new URL(url))
            .map(url => url.host === 'dps.report' ? loadDPSReportData(team, url) : loadWingmanData(team, url)))
        await Database.singleton().log.createMany({ data })

    })
