import type { RequestHandler } from '@sveltejs/kit'
import {
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    REDIRECT_URI,
    AUTHORIZATION_SCOPES,
    TOKEN_URI
} from '../../../lib/auth'

export const get: RequestHandler = async event => {
    const query = event.url.searchParams
    const refreshToken = query.get('code')
    if(!refreshToken)
        return {
            status: 500,
            body: JSON.stringify({
                error: 'No refresh token found'
            })
        }
    const data: Record<string, string> = {
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET,
        grant_type: 'refresh_token',
        code: refreshToken
    }
    const request = await fetch(TOKEN_URI, {
        method: 'POST',
        body: new URLSearchParams(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    const response = await request.json()
    if(response.error){
        return {
            status: 500,
            body: JSON.stringify({ response_error: response.error })
        }
    }
    const accessExpiry = new Date(Date.now() + response.expires_in)
    const refreshExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    return {
        status: 200,
        headers: {
            'set-cookie': [
                `access_token=${response.access_token}; Path=/; HttpOnly; SameSite=Strict; Expires=${accessExpiry}`,
                `refresh_token=${response.refresh_token}; Path=/; HttpOnly; SameSite=Strict; Expires=${refreshExpiry}`,
            ]
        },
        body: JSON.stringify({
            access_token: response.access_token
        })
    }
}
