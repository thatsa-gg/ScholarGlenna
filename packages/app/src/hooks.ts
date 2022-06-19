import type { GetSession, Handle } from '@sveltejs/kit'
import { parse } from 'cookie'
import { REFRESH_URI } from './lib/auth'
import { getUserInfo } from './lib/discord-rest'

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
    const refreshToken = cookies['refresh_token']
    let accessToken = cookies['access_token']
    const newCookies = []
    if(refreshToken && !accessToken){
        const refresh = await fetch(`${REFRESH_URI}?code=${refreshToken}`)
        const response = await refresh.json()
        if(response['access_token']){
            accessToken = response['access_token']
            newCookies.push(`access_token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Expires=${response['now'] + response['expires_in']}`)
            if(response['refresh_token']){
                newCookies.push(`refresh_token=${response['refresh_token']}; Path=/; HttpOnly; SameSite=Lax; Expires=${response['now'] + 24 * 60 * 60 * 1000}`)
            }
        }
    }

    if(accessToken)
        locals.user = await getUserInfo(accessToken)
    const response = await resolve(event)
    for(const cookie of newCookies)
        response.headers.append('Set-Cookie', cookie)
    return response
}

export const getSession: GetSession = event => {
    const { locals } = event
    return {
        user: locals.user ?? false
    }
}
