import {
    cache,
    SSO_RETURN_URI,
} from './index'
import { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } from '$env/static/private'
import {
    RouteBases,
    Routes,
    OAuth2Routes,
    OAuth2Scopes,
    type RESTPostOAuth2RefreshTokenResult,
    type RESTPostOAuth2AccessTokenResult,
} from 'discord-api-types/v10'
import { z } from 'zod'
import { redirect } from '@sveltejs/kit'
import { v4 as uuid } from 'uuid'

const authorizationScopes = [
    OAuth2Scopes.Identify,
].join(' ')

export type Authorization = {
    accessToken: string
    refreshToken: string
    expiresIn: number
}

const AccessToken = z.object({
    token_type: z.string(),
    scope: z.string(),
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number()
})

const RefreshToken = z.object({
    token_type: z.string(),
    scope: z.string(),
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number()
})

export async function authorizeUser(oauth2Code: string, state: string): Promise<Authorization> {
    const response = await fetch(`${RouteBases.api}${Routes.oauth2TokenExchange()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: OAUTH_CLIENT_ID,
            client_secret: OAUTH_CLIENT_SECRET,
            grant_type: `authorization_code`,
            redirect_uri: SSO_RETURN_URI,
            code: oauth2Code,
            scope: authorizationScopes
        })
    })
    const result = AccessToken.parse(await response.json()) satisfies RESTPostOAuth2AccessTokenResult
    return {
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expiresIn: result.expires_in,
    }
}

export async function reauthorizeUser(refreshToken: string): Promise<Authorization> {
    const response = await fetch(`${RouteBases.api}/${Routes.oauth2TokenExchange()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: OAUTH_CLIENT_ID,
            client_secret: OAUTH_CLIENT_SECRET,
            grant_type: `refresh_token`,
            refresh_token: refreshToken
        })
    })
    const result = RefreshToken.parse(await response.json()) satisfies RESTPostOAuth2RefreshTokenResult
    return {
        accessToken: result.access_token,
        refreshToken: result.refresh_token || refreshToken,
        expiresIn: result.expires_in
    }
}

async function newState(){
    let id = uuid()
    while(await cache.client.exists(`oauth2state:${id}`))
        id = uuid()
    return id
}

function maybeUrlToString(url: string | URL){
    if(typeof url === 'string')
        return url
    return `${url.pathname}${url.search}`
}

export async function redirectAuth(url: string | URL){
    const state = await newState()
    await cache.client.set(`oauth2state:${state}`, maybeUrlToString(url), "EX", 10 * 60) // 10 minutes

    const params = new URLSearchParams()
    params.append(`client_id`, OAUTH_CLIENT_ID)
    params.append(`redirect_uri`, SSO_RETURN_URI)
    params.append(`response_type`, `code`)
    params.append(`scope`, [
        OAuth2Scopes.Identify,
        OAuth2Scopes.Guilds
    ].join(" "))
    params.append(`state`, state)
    return redirect(302, `${OAuth2Routes.authorizationURL}?${params}`)
}
