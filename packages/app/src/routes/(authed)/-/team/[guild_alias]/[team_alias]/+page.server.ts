import { Database } from '@glenna/common'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, parent }) => {
    const { user } = await parent()
    const { guild_alias, team_alias } = params
    const lookup = await Database.Client.teamLookup.findUnique({
        where: { team_alias_guild_alias: { team_alias, guild_alias }},
        select: {
            team: {
                select: {
                    name: true
                }
            }
        }
    })
    if(!lookup)
        throw error(404)
    const { team } = lookup
    return {
        user,
        team
    }
}
