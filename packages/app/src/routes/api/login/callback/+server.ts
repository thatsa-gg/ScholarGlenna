import { redirect, type RequestHandler } from '@sveltejs/kit'
import { authorizeUser } from '$lib/auth'
import { createSession } from '$lib/server/session'

export const GET: RequestHandler = async ({ cookies, url }) => {
    const authorization = await authorizeUser(url.searchParams.get('code'))
    const session = await createSession(authorization)
    cookies.set('session_id', session.id, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        expires: session.expiration
    })
    throw redirect(302, '/-/dashboard')
}
