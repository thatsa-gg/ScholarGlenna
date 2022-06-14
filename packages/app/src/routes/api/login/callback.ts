import type { RequestHandler } from '@sveltejs/kit'
import {
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET
} from '@glenna/common'
import { callbackUri } from './index'

type Params = {
    code: string
}
export const get: RequestHandler<Params> = async event => {
    const query = event.url.searchParams
    const code = query.get('code')!
    const data: Record<string, string> = {
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET,
        grant_type: `authorization_code`,
        redirect_uri: callbackUri,
        code: code,
        scope: 'identify guilds'
    }
    const request = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    const response = await request.json()
    const accessExpiry = new Date(Date.now() + response.expires_in)
    const refreshExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    return {
        status: 302,
        headers: {
            'set-cookie': [
                `access_token=${response.access_token}; Path=/; HttpOnly; SameSite=Strict; Expires=${accessExpiry}`,
                `refresh_token=${response.refresh_token}; Path=/; HttpOnly; SameSite=Strict; Expires=${refreshExpiry}`,
            ],
            Location: '/'
        }
    }
}
