import { Database, type Guild, type Team } from '@glenna/common'
import type { PageServerLoad } from './$types'

export type _Guild = Pick<Guild, 'guild_id' | 'alias' | 'name'>
export type _Team = Pick<Team, 'team_id' | 'alias' | 'name'>
export const GET: PageServerLoad = async event => {
    const { user = false } = await event.parent()
    const data = user ? await Database.Client.user.findUnique({
        where: { user_id: user.user_id },
        select: {
            guild_memberships: {
                select: {
                    guild: {
                        select: {
                            guild_id: true,
                            alias: true,
                            name: true
                        }
                    }
                }
            },
            team_memberships: {
                select: {
                    team: {
                        select: {
                            team_id: true,
                            alias: true,
                            name: true
                        }
                    }
                }
            }
        }
    }) : null
    return {
        status: 200,
        body: {
            user,
            guilds: data?.guild_memberships.map(m => m.guild) ?? [],
            teams: data?.team_memberships.map(m => m.team) ?? []
        }
    }
}
