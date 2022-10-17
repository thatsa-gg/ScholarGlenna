import { url } from '$lib/urls'
import { Database } from '@glenna/common'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
    const { user } = await parent()
    const data = await Database.Client.user.findUnique({
        where: { user_id: user.user_id },
        select: {
            team_memberships: {
                select: {
                    team: {
                        select: {
                            lookup: {
                                select: {
                                    team_id: true,
                                    guild_alias: true,
                                    team_alias: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    return {
        user,
        teams: data?.team_memberships.map(m => m.team.lookup!).map(m => ({ ...m, url: url('team', m, m) })) ?? []
    }
}
