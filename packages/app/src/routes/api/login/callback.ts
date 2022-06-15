import type { RequestHandler } from '@sveltejs/kit'
import {
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    REDIRECT_URI,
    AUTHORIZATION_SCOPES,
    TOKEN_URI
} from '../../../lib/auth'

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
        redirect_uri: REDIRECT_URI,
        code: code,
        scope: AUTHORIZATION_SCOPES
    }
    const request = await fetch(TOKEN_URI, {
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
