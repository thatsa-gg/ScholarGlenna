import { initializeDatabase } from '@glenna/common'
await initializeDatabase()

import type { GetSession, Handle } from '@sveltejs/kit'
import { parse } from 'cookie'
import { getUserInfo } from '$lib/discord-rest'
import { getSession as getSessionState } from '$lib/session'

const HANDLE_EXCLUDED_ROUTES = new Set<string>([
    '/api/login',
    '/api/login/callback',
    '/api/login/refresh',
    '/api/logout',
])

export const handle: Handle = async ({ event, resolve }) => {
    const { request, url, locals } = event
    if(HANDLE_EXCLUDED_ROUTES.has(url.pathname))
        return resolve(event)
    const cookies = parse(request.headers.get('cookie') ?? '')
    const sessionID = cookies['session_id']
    if(!sessionID)
        return resolve(event)
    const session = await getSessionState(sessionID)
    if(session)
        locals.user = await getUserInfo(session.accessToken)
    return resolve(event)
}

export const getSession: GetSession = event => {
    const { locals } = event
    return {
        user: locals.user ?? false
    }
}
