import { getSession } from '$lib/session'
import { Database } from '@glenna/common'
import { asJsonSafe } from '@glenna/util'
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
export const load: LayoutServerLoad = async ({ cookies }) => {
    const sessionID = cookies.get('session_id')
    if(!sessionID)
        return {}

    const session = await getSession(sessionID)
    if(!session)
        throw redirect(303, '/api/logout')

    const profile = await Database.Client.userProfile.findUnique({ where: { profile_id: session.profileId }})
    if(!profile)
        throw redirect(303, '/api/logout')

    return {
        user: { ...asJsonSafe(profile), displayName: `${profile.username}#${profile.discriminator.toString().padStart(4, '0')}` }
    }
}
