import type { Actions, PageServerLoad } from './$types'
import { trpc } from '$lib/server/trpc'
import { database } from '$lib/server'
import { fail } from '@sveltejs/kit'
import { stringifySnowflake } from '@glenna/prisma'

export const actions: Actions = {
    async default({ request }){
        const data = await request.formData()
        const team = data.get('team')
        const links = data.get('links')
        if(!team)
            return fail(400, { team, missing: true })
        if(typeof team !== 'string')
            return fail(400, { team, incorrect: true })
        if(!links)
            return fail(400, { links, missing: true })
        if(typeof links !== 'string')
            return fail(400, { team, incorrect: true })
        const logs = links.split(/\r?\n/g)
            .map(link => link.trim())
            .filter(link => link !== '')
        if(logs.length === 0)
            return fail(400, { links, missing: true })
        const invalid = logs.filter(link => !/^(?:https:\/\/)?(?:(?:(?:www|a|b)\.)?dps\.report\/[a-zA-Z0-9_-]+|gw2wingman\.nevermindcreations\.de\/log\/[a-zA-Z0-9_-]+)$/.test(link))
        if(invalid.length > 0)
            return fail(400, { links, invalid })

        // save most expensive operation for last
        if(!await database.team.findUnique({ where: { snowflake: BigInt(team) }}))
            return fail(400, { team, incorrect: true })

        await trpc.log.submit({ team, logs })
        return { success: true }
    }
}

export const load: PageServerLoad = async ({ }) => {
    const teams = await database.team.findMany({
        where: {
            type: 'Normal'
        },
        select: {
            name: true,
            snowflake: true,
        }
    })
    return {
        teams: teams.map(team => stringifySnowflake(team))
    }
}
