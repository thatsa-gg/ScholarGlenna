import { prerendering } from '$app/env'
import { Database } from '@glenna/common'
import { asJsonSafe } from '@glenna/util'

import type { GetSession, Handle } from '@sveltejs/kit'
import { parse } from 'cookie'
import { getSession as getSessionState } from '$lib/session'

const HANDLE_EXCLUDED_ROUTES = new Set<string>([
    '/api/login',
    '/api/login/callback',
    '/api/logout',
    '/api/invite',
])

export const handle: Handle = prerendering
? ({ event, resolve}) => resolve(event)
: async ({ event, resolve }) => {
    const { request, url, locals } = event
    if(HANDLE_EXCLUDED_ROUTES.has(url.pathname))
        return resolve(event)

    const cookies = parse(request.headers.get('cookie') ?? '')
    const sessionID = cookies['session_id']
    if(!sessionID)
        return resolve(event)

    const session = await getSessionState(sessionID)
    if(!session)
        return new Response(null, { status: 303, headers: { Location: '/api/logout' }})

    const profile = await Database.Client.userProfile.findUnique({ where: { profile_id: session.profileId } })
    if(!profile)
        return new Response(null, { status: 303, headers: { Location: '/api/logout' } })

    locals.user = { ...asJsonSafe(profile), displayName: `${profile.username}#${profile.discriminator.toString().padStart(4, '0')}` }
    return resolve(event)
}

export const getSession: GetSession = event => {
    const { locals } = event
    return {
        user: locals.user ?? false
    }
}
