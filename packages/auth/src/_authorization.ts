import {
    Routes,
    OAuth2Scopes,
    REST,
    type RESTPostOAuth2RefreshTokenResult,
    type RESTPostOAuth2AccessTokenResult,
    RouteBases,
} from '@glenna/discord'
import { getConfig } from './config.js'
import { z } from 'zod'

const baseUri = `http://localhost:8080/api`
const redirectUri = `${baseUri}/login/callback`
const authorizationScopes = [
    OAuth2Scopes.Identify,
].join(' ')
const config = getConfig()
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
    const response = await fetch(`${RouteBases.api}/${Routes.oauth2TokenExchange()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: config.OAUTH_CLIENT_ID,
            client_secret: config.OAUTH_CLIENT_SECRET,
            grant_type: `authorization_code`,
            redirect_uri: redirectUri,
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
            client_id: config.OAUTH_CLIENT_ID,
            client_secret: config.OAUTH_CLIENT_SECRET,
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
