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
        throw redirect(303, '/api/logout')

    const profile = await database.profile.findUnique({
        where: { id: session.profileId },
        select: {
            id: true,
            user: {
                select: {
                    name: true,
                    discriminator: true,
                    avatar: true
                }
            }
        }
    })
    if(!profile)
        throw redirect(303, '/api/logout')

    // manual copy done here to avoid "Symbol(nodejs.util.inspect.custom)"
    // added by Prisma when client extension properties are used.
    // Vite doesn't know how to serialize those
    return {
        user: {
            name: profile.user.name,
            discriminator: profile.user.discriminator,
            avatar: profile.user.avatar
        }
    }
}) satisfies LayoutServerLoad
