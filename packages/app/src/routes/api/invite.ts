import type { RequestHandler } from '@sveltejs/kit'
import { AUTHORIZATION_URI, OAUTH_CLIENT_ID } from '../../lib/auth'

export const get: RequestHandler = async () => {
    return {
        status: 302,
        headers: {
            Location: `${AUTHORIZATION_URI}?${new URLSearchParams({
                client_id: OAUTH_CLIENT_ID,
                permissions: '268454992',
                scope: 'bot applications.commands'
            })}`
        }
    }
}
