import { Database } from '@glenna/common'
import { url } from '$lib/urls'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
    const { user } = await parent()
    const data = await Database.Client.user.findUnique({
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
        guilds: data?.guild_memberships.map(m => ({ ...m.guild, url: url.guild(m.guild) })) ?? [],
        teams: data?.team_memberships.map(m => ({ ...m.team.lookup!, url: url.team(m.team.lookup!) })) ?? []
    }
}
