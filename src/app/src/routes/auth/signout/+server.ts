import { redirect, type RequestHandler } from '@sveltejs/kit'
import { destroySession } from '$lib/server/session'

export const GET = (async ({ cookies }) => {
    // find the cookie
    const sessionID = cookies.get('session_id')

    // if there is one, delete any associated session and the attached API tokens
    if(sessionID)
        await destroySession(sessionID)

    // purge the cookie
    cookies.delete('session_id', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
    })

    // just send them back to the main page when they log out
    throw redirect(302, '/')
}) satisfies RequestHandler
