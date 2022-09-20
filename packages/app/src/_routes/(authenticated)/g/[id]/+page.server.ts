import { type RequestHandler, error } from '@sveltejs/kit'
import { Database, type Guild, type Team } from '@glenna/common'

export type _Guild = Pick<Guild, 'name' | 'alias'> & { teams: Pick<Team, 'name' | 'alias'>[] }
export const GET: RequestHandler = async event => {
    const user = event.locals.user ?? false
    const alias = event.params['id']
    if(!alias)
        throw error(404)
    const guild = await Database.Client.guild.findUnique({ where: { alias }, select: {
        name: true,
        alias: true,
        teams: {
            select: {
                name: true,
                alias: true,
            }
        }
    }})
    if(!guild)
        throw error(404)
    return {
        status: 200,
        body: {
            user,
            guild
        }
    }
}
