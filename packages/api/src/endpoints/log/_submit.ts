import { z } from 'zod'
import { procedure } from '../../trpc.js'

enum LogMode {
    Normal = 0,
    Challenge = -1,
    Emboldened1 = 1,
    Emboldened2 = 2,
    Emboldened3 = 3,
    Emboldened4 = 4,
    Emboldened5 = 5
}

type LogPlayerData = {
    account: string,
    character: string,
}

type LogData = {
    url: URL
    date: Date
    duration: number
    mode: LogMode
    success: boolean
    players: LogPlayerData[]
}

class LogError extends Error {
    innerError: Error
    constructor(message: string, ex: Error){
        super(message)
        this.innerError = ex
    }
}

async function loadDPSReportData(url: URL): LogData | Error {
    try {
        const response = await fetch(`https://dps.report/getJson?permalink=${url.pathname.slice(1)}`)
        const data = await response.json()
        return {
            url: url,
            date: new Date(data.encounterTime * 1000),
            //duration: data.encounter.duration as number,
            mode:
        }
    } catch(e) {
        return new LogError(`Failed to load log data for ${url}`, e)
    }
}

async function loadWingmanData(url: URL){
    const response = await fetch(`https://gw2wingman.nevermindcreations.de/api/getMetadata/${url.pathname.replace(/^\/log\//, '')}`)
    const data = await response.json()
}

export const submitProcedure = procedure
    .input(z.object({
        teamName: z.string(),
        logs: z.array(z
            .string()
            .regex(/^(?:https:\/\/)?(?:dps\.report\/[a-zA-Z0-9_-]+|gw2wingman\.nevermindcreations\.de\/log\/[a-ZA-Z0-9_-]+)$/))
    }))
    .mutation(({ input }) => {
        const { teamName, logs } = input
        // TODO: validate team name
        const logData = logs
            .map(url => new URL(url))
            .map(url => ({
                url,
                data: url.host === 'dps.report' ? loadDPSReportData(url) : loadWingmanData(url)
            }))
    })
