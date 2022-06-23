import { prerendering } from '$app/env'
import { AppDataSource } from '@glenna/common'
if(!prerendering){
    // initialize DB
    void await AppDataSource
}

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
    if(session)
        locals.user = await (await AppDataSource).Profiles.get(session.userId)
    return resolve(event)
}

export const getSession: GetSession = event => {
    const { locals } = event
    return {
        user: locals.user ?? false
    }
}
