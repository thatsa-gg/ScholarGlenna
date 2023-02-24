import { url } from '$lib/urls'
import { Database } from '@glenna/common'
import type { PageLoadServerLoad } from './$types'

export const load: PageLoadServerLoad = async ({ parent }) => {
    const { user } = await parent()
    const data = await Database.Client.user.findUniqueOrThrow({
        where: { user_id: user.user_id },
        select: {
            snowflake: true,
            avatar: true,
            guild_memberships: {
                select: {
                    guild: {
                        select: {
                            alias: true,
                            name: true,
                        }
                    },
                    team_memberships: {
                        select: {
                            team: {
                                select: {
                                    alias: true,
                                    name: true,
                                    role: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    return {
        user: {
            displayName: user.displayName,
            avatar: url.avatar.user(data, { size: 64 }),
            username: user.username,
            discriminator: user.discriminator,
        },
        guilds: data.guild_memberships.map(m => ({
            name: m.guild.name,
            url: url.guild(m.guild),
            teams: m.team_memberships.map(t => ({
                name: t.team.name,
                role: t.team.role,
                url: url.team(m.guild, t.team)
            }))
        })) ?? []
    }
}
