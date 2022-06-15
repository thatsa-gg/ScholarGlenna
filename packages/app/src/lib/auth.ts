import { writable } from 'svelte/store'

const {
    _OAUTH_CLIENT_ID,
    _OAUTH_CLIENT_SECRET,
} = process.env
if(!_OAUTH_CLIENT_ID) throw `[env] Missing: OAUTH_CLIENT_ID`
if(!_OAUTH_CLIENT_SECRET) throw `[env] Missing: OAUTH_CLIENT_SECRET`
export const OAUTH_CLIENT_ID: string = _OAUTH_CLIENT_ID
export const OAUTH_CLIENT_SECRET: string = _OAUTH_CLIENT_SECRET

export const AUTHORIZATION_URI: string = 'https://discord.com/api/oauth2/authorize'
export const TOKEN_URI: string = 'https://discord.com/api/oauth2/token'
export const REDIRECT_URI: string = 'http://localhost:8080/api/login/callback'
export const AUTHORIZATION_SCOPES: string = [
    'identify',
    'guilds',
].join(' ')

export const session = writable(null)
export const logout = () => {
    // TODO
    session.set(null)
}
export const login = () => {
    // TODO
}
