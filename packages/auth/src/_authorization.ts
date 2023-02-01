import {
    Routes,
    REST,
    OAuth2Scopes,
    type RESTPostOAuth2RefreshTokenResult,
    type RESTPostOAuth2AccessTokenResult,
} from '@glenna/discord'
import { getConfig } from './config.js'

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

const authorizationClient = new REST({ version: '10' })
export async function authorizeUser(oauth2Code: string): Promise<Authorization> {
    const result = await authorizationClient.post(Routes.oauth2TokenExchange(), {
        passThroughBody: true,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: config.OAUTH_CLIENT_ID,
            client_secret: config.OAUTH_CLIENT_SECRET,
            grant_type: `authorization_code`,
            redirect_uri: redirectUri,
            code: oauth2Code,
            scope: authorizationScopes
        })
    }) as RESTPostOAuth2AccessTokenResult
    return {
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expiresIn: result.expires_in,
    }
}

export async function reauthorizeUser(refreshToken: string): Promise<Authorization> {
    const result = await authorizationClient.post(Routes.oauth2TokenExchange(), {
        passThroughBody: true,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: config.OAUTH_CLIENT_ID,
            client_secret: config.OAUTH_CLIENT_SECRET,
            grant_type: `refresh_token`,
            refresh_token: refreshToken
        })
    }) as RESTPostOAuth2RefreshTokenResult
    return {
        accessToken: result.access_token,
        refreshToken: result.refresh_token || refreshToken,
        expiresIn: result.expires_in
    }
}
