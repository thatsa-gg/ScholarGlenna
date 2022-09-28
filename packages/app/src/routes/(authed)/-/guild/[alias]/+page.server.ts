import { Database } from '@glenna/common'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent, params }) => {
    const { user } = await parent()
    const { alias } = params
    const guild = await Database.Client.guild.findUnique({
        where: { alias },
        select: {
            name: true,
            teams: {
                select: {
                    name: true,
                    alias: true
                }
            }
        }
    })
    if(!guild)
        throw error(404)
    return {
        user,
        guild: {
            name: guild.name,
            newTeamUrl: `/-/team/${alias}/-/new`,
            teams: guild.teams.map(team => ({ ...team, url: `/-/team/${alias}/${team.alias}` }))
        }
    }
}
