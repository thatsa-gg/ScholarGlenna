import { writable } from 'svelte/store'

const {
    OAUTH_CLIENT_ID: _OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET: _OAUTH_CLIENT_SECRET,
} = process.env
if(!_OAUTH_CLIENT_ID) throw `[env] Missing: OAUTH_CLIENT_ID`
if(!_OAUTH_CLIENT_SECRET) throw `[env] Missing: OAUTH_CLIENT_SECRET`
export const OAUTH_CLIENT_ID: string = _OAUTH_CLIENT_ID
export const OAUTH_CLIENT_SECRET: string = _OAUTH_CLIENT_SECRET

export const AUTHORIZATION_URI: string = 'https://discord.com/api/oauth2/authorize'
export const TOKEN_URI: string = 'https://discord.com/api/oauth2/token'

const API_BASE_URI = 'http://localhost:8080/api'
export const LOGIN_URI: string = `${API_BASE_URI}/login`
export const REDIRECT_URI: string = `${LOGIN_URI}/callback`
export const REFRESH_URI: string = `${LOGIN_URI}/refresh`
export const LOGOUT_URI: string = `${API_BASE_URI}/logout`
export const AUTHORIZATION_SCOPES: string = [
    'identify',
    'guilds',
].join(' ')
