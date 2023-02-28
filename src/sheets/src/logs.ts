import { client } from './trpc'
export async function TOPLOGS_DIVISION(division: string){
    const results = await client.log.top.find.query({ division })
    return JSON.stringify(Object.fromEntries(results.map(result => [
        `${result.boss}${result.difficulty === 'ChallengeMode' ? 'CM' : ''}`,
        result
    ])))
}

export async function TOPLOGS_TEAM(team: string){
    const results = await client.log.top.find.query({ team })
    return JSON.stringify(Object.fromEntries(results.map(result => [
        `${result.boss}${result.difficulty === 'ChallengeMode' ? 'CM' : ''}`,
        result
    ])))
}
