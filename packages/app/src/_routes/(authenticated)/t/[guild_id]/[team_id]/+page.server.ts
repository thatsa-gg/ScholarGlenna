import { error, type RequestHandler } from '@sveltejs/kit'
import { Database, type Guild, type Team } from '@glenna/common'

export type _Team = Pick<Team, 'name'> & { teams: Pick<Team, 'name' | 'alias'>[] }
export const GET: RequestHandler = async event => {
    const user = event.locals.user ?? false
    const { guild_id, team_id } = event.params
    if(!guild_id || !team_id)
        throw error(404)
    const lookup = await Database.Client.teamLookup.findUnique({
        where: {
            team_alias_guild_alias: {
                team_alias: team_id,
                guild_alias: guild_id,
            }
        },
        select: {
            team: {
                select: {
                    name: true,
                }
            }
        }
    })
    if(!lookup)
        throw error(404)
    const { team } = lookup
    return {
        status: 200,
        body: {
            user,
            team
        }
    }
}
