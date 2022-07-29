import type { RequestHandler } from '@sveltejs/kit'
import {
    OAUTH_CLIENT_ID,
    AUTHORIZATION_URI,
    AUTHORIZATION_SCOPES,
    REDIRECT_URI
} from '../../../lib/auth'

export const GET: RequestHandler = async() => {
    const params = new URLSearchParams()
    params.append(`client_id`, OAUTH_CLIENT_ID)
    params.append(`redirect_uri`, REDIRECT_URI)
    params.append(`response_type`, `code`)
    params.append(`scope`, AUTHORIZATION_SCOPES)
    return {
        status: 302,
        headers: {
            Location: `${AUTHORIZATION_URI}?${params}`
        }
    }
}
