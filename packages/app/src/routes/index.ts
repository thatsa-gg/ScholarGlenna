import type { RequestHandler } from '@sveltejs/kit'
import { Database } from '@glenna/common'

export const GET: RequestHandler = async event => {
    const user = event.locals.user ?? false
    // Guilds.getForUser(user.user_id).then(a => a.map(b => b.json()))
    const guilds = !user ? [] : await Database.Client.user.findUnique({
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
            }
        }
    }).then(result => result?.guild_memberships.map(membership => membership.guild) ?? [])
    return {
        status: 200,
        body: {
            user, guilds
        }
    }
}
