import { error, redirect } from '@sveltejs/kit'
import { Database } from '@glenna/common'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
    const { guild_alias, team_alias } = params
    const team = await Database.Client.teamLookup.findUnique({
        where: {
            team_alias_guild_alias: {
                guild_alias, team_alias
            }
        },
        select: null
    })
    if(!team)
        throw error(404)
    throw redirect(303, `/-/team/${guild_alias}/${team_alias}`)
}
