import { SSO_RETURN_URI } from './index'
import { env } from '$env/dynamic/private'
import {
    RouteBases,
    Routes,
    OAuth2Scopes,
    type RESTPostOAuth2RefreshTokenResult,
    type RESTPostOAuth2AccessTokenResult,
} from '@glenna/discord'
import { z } from 'zod'

const authorizationScopes = [
    OAuth2Scopes.Identify,
].join(' ')

if(!env.OAUTH_CLIENT_ID)
    throw `[env] Missing: OAUTH_CLIENT_ID`
if(!env.OAUTH_CLIENT_SECRET)
    throw `[env] Missing: OAUTH_CLIENT_SECRET`

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

export async function authorizeUser(oauth2Code: string): Promise<Authorization> {
    const response = await fetch(`${RouteBases.api}${Routes.oauth2TokenExchange()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: env.OAUTH_CLIENT_ID,
            client_secret: env.OAUTH_CLIENT_SECRET,
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
            client_id: env.OAUTH_CLIENT_ID,
            client_secret: env.OAUTH_CLIENT_SECRET,
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
