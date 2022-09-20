import { Database } from '@glenna/common'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async event => {
    const { user = null } = await event.parent()
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
        user: user as typeof user,
        guilds: data?.guild_memberships.map(m => m.guild) ?? [],
        teams: data?.team_memberships.map(m => m.team) ?? []
    }
}
