import { Routes } from 'discord-api-types/v10'

const {
    OAUTH_CLIENT_ID: _OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET: _OAUTH_CLIENT_SECRET,
    DISCORD_TOKEN: _DISCORD_TOKEN,
} = process.env
if(!_OAUTH_CLIENT_ID) throw `[env] Missing: OAUTH_CLIENT_ID`
if(!_OAUTH_CLIENT_SECRET) throw `[env] Missing: OAUTH_CLIENT_SECRET`
if(!_DISCORD_TOKEN) throw `[env] Missing: DISCORD_TOKEN`
export const OAUTH_CLIENT_ID: string = _OAUTH_CLIENT_ID
export const OAUTH_CLIENT_SECRET: string = _OAUTH_CLIENT_SECRET
export const DISCORD_TOKEN: string = _DISCORD_TOKEN

export const AUTHORIZATION_URI: string = `https://discord.com/api${Routes.oauth2Authorization()}`
export const TOKEN_URI: string = `https://discord.com/api${Routes.oauth2TokenExchange()}`

const API_BASE_URI = 'http://localhost:8080/api'
export const LOGIN_URI: string = `${API_BASE_URI}/login`
export const REDIRECT_URI: string = `${LOGIN_URI}/callback`
export const REFRESH_URI: string = `${LOGIN_URI}/refresh`
export const LOGOUT_URI: string = `${API_BASE_URI}/logout`
export const AUTHORIZATION_SCOPES: string = [
    'identify',
    'guilds',
].join(' ')

export interface Authorization {
    access_token: string
    refresh_token: string
    expires_in: number
}
export async function authorizeUser(code: string | null): Promise<Authorization> {
    if(!code)
        throw new Error("Missing authorization code.")
    const request = await fetch(TOKEN_URI, {
        method: 'POST',
        body: new URLSearchParams({
            client_id: OAUTH_CLIENT_ID,
            client_secret: OAUTH_CLIENT_SECRET,
            grant_type: `authorization_code`,
            redirect_uri: REDIRECT_URI,
            code: code,
            scope: AUTHORIZATION_SCOPES
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    const response = await request.json()
    if(response.error){
        throw new Error(response.error)
    }
    return {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_in: response.expires_in
    }
}

export type Reauthorization = Partial<Authorization> & Omit<Authorization, 'refresh_token'>
export async function reauthorizeUser(refreshToken: string): Promise<Reauthorization> {
    const request = await fetch(TOKEN_URI, {
        method: 'POST',
        body: new URLSearchParams({
            client_id: OAUTH_CLIENT_ID,
            client_secret: OAUTH_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    const response = await request.json()
    if(response.error)
        throw new Error(response.error)
    return {
        access_token: response.access_token,
        refresh_token: response.refresh_token || refreshToken,
        expires_in: response.expires_in
    }
}
