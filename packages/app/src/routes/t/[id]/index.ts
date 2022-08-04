import type { RequestHandler } from '@sveltejs/kit'
import { Database, type Guild, type Team } from '@glenna/common'
import { notFound } from '$lib/status'

export type _Team = Pick<Team, 'name'> & { teams: Pick<Team, 'name' | 'alias'>[] }
export const GET: RequestHandler = async event => {
    const user = event.locals.user ?? false
    const alias = event.params['id']
    if(!alias)
        return notFound()
    const guild = await Database.Client.team.findUnique({ where: { alias }, select: {
        name: true,
        members: {
            select: {
                role: true,
                guild_member: {
                    select: {
                        nickname: true,
                        avatar: true,
                    }
                }
            }
        }
    }})
    if(!guild)
        return notFound()
    return {
        status: 200,
        body: {
            user,
            guild
        }
    }
}
