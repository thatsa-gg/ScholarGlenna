import { redirect, type RequestHandler } from '@sveltejs/kit'
import { destroySession } from '$lib/server/session'

export const GET: RequestHandler = async ({ cookies }) => {
    const sessionID = cookies.get('session_id')
    if(sessionID)
        await destroySession(sessionID)
    cookies.delete('session_id', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
    })
    throw redirect(302, '/')
}
