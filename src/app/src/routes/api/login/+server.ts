import { redirect, type RequestHandler } from '@sveltejs/kit'
import { OAuth2Routes, OAuth2Scopes } from '@glenna/discord'
import { REDIRECT_URI, OAUTH_CLIENT_ID } from '$lib/server'

export const GET: RequestHandler = async() => {
    const params = new URLSearchParams()
    params.append(`client_id`, OAUTH_CLIENT_ID)
    params.append(`redirect_uri`, REDIRECT_URI)
    params.append(`response_type`, `code`)
    params.append(`scope`, [
        OAuth2Scopes.Identify,
        OAuth2Scopes.Guilds
    ].join(" "))
    throw redirect(302, `${OAuth2Routes.authorizationURL}?${params}`)
}
