import { error, redirect, type RequestHandler } from '@sveltejs/kit'
import { authorizeUser } from '@glenna/auth'
import { createSession } from '$lib/server/session'

export const GET: RequestHandler = async ({ cookies, url }) => {
    const code = url.searchParams.get('code')
    if(!code)
        throw error(400, `Missing authorization code.`)
    const authorization = await authorizeUser(code)
    const session = await createSession(authorization)
    cookies.set('session_id', session.id, {
        path: '/',
        expires: session.expiration
    })
    const target = cookies.get('nav_after_login')
    if(target){
        cookies.delete('nav_after_login')
        throw redirect(302, target)
    }
    throw redirect(302, '/')
}
