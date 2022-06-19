import type { RequestHandler } from '@sveltejs/kit'
import { destroySession } from '$lib/session'
import { parse } from 'cookie'

// TODO: destroy session in redis
export const get: RequestHandler = async event => {
    const cookies = parse(event.request.headers.get('cookie') ?? '')
    const sessionID = cookies['session_id']
    if(sessionID)
        await destroySession(sessionID)
    return {
        status: 302,
        headers: {
            Location: '/',
            'set-cookie': [
                `session_id=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=-1`
            ]
        }
    }
}
