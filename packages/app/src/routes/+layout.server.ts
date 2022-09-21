import { getSession } from '$lib/server/session'
import { Database } from '@glenna/common'
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

    const user = await Database.Client.userProfile.findUnique({
        where: { profile_id: session.profileId },
        select: {
            user_id: true,
            username: true,
            discriminator: true,
            displayName: true,
            snowflake: true,
            avatar: true
        }
    })
    if(!user)
        throw redirect(303, '/api/logout')

    return { user }
}
