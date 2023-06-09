import { getSession } from '$lib/server/session'
import { database } from '$lib/server'
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const prerender = false
export const load = (async ({ cookies }) => {
    const sessionID = cookies.get('session_id')
    if(!sessionID)
        return { user: null }

    const session = await getSession(sessionID)
    if(!session)
        throw redirect(303, '/auth/signout')

    const profile = await database.profile.findUnique({
        where: { id: session.profileId },
        select: {
            id: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    snowflake: true
                }
            }
        }
    })
    if(!profile)
        throw redirect(303, '/auth/signout')

    // manual copy done here to avoid "Symbol(nodejs.util.inspect.custom)"
    // added by Prisma when client extension properties are used.
    // Vite doesn't know how to serialize those
    return {
        user: {
            id: profile.user.id,
            name: profile.user.name,
            avatar: profile.user.avatar,
            snowflake: profile.user.snowflake,
        }
    }
}) satisfies LayoutServerLoad
