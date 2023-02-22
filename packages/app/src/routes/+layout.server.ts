import { getSession } from '$lib/server/session'
import { database } from '$lib/server'
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const prerender = false
export const load: LayoutServerLoad = async ({ cookies }) => {
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
                    id: true,
                    name: true,
                    discriminator: true,
                    snowflake: true,
                    icon: true
                }
            }
        }
    })
    if(!profile)
        throw redirect(303, '/api/logout')

    return { user: profile.user }
}
