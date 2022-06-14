import type { RequestHandler } from '@sveltejs/kit'
import { OAUTH_CLIENT_ID } from '@glenna/common'

const base = `https://discord.com/api/oauth2/authorize`
export const callbackUri = `http://localhost:8080/api/login/callback`
export const scope = [
    'identify',
    'guilds',
].join(' ')

export const get: RequestHandler = async() => {
    const params = new URLSearchParams()
    params.append(`client_id`, OAUTH_CLIENT_ID)
    params.append(`redirect_uri`, callbackUri)
    params.append(`response_type`, `code`)
    params.append(`scope`, scope)
    return {
        status: 302,
        headers: {
            Location: `${base}?${params}`
        }
    }
}
