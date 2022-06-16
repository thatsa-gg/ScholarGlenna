import type { RequestHandler } from '@sveltejs/kit'
import {
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
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
    if(response.error){
        return {
            status: 500,
            body: JSON.stringify({ response_error: response.error })
        }
    }
    return {
        status: 200,
        body: JSON.stringify({
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            now: Date.now(),
            expires_in: response.expires_in,
        })
    }
}
