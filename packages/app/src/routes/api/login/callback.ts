import type { RequestHandler } from '@sveltejs/kit'
import { authorizeUser } from '$lib/auth'
import { createSession } from '$lib/session'

type Params = {
    code: string
}
export const get: RequestHandler<Params> = async event => {
    const query = event.url.searchParams
    const code = query.get('code') ?? null
    try {
        const authorization = await authorizeUser(code)
        const session = await createSession(authorization)
        const accessExpiry = new Date(Date.now() + authorization.expires_in)
        const refreshExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
        return {
            status: 302,
            headers: {
                'set-cookie': [
                    `access_token=${authorization.access_token}; Path=/; HttpOnly; SameSite=Lax; Expires=${accessExpiry}`,
                    `refresh_token=${authorization.refresh_token}; Path=/; HttpOnly; SameSite=Lax; Expires=${refreshExpiry}`,
                ],
                Location: '/'
            }
        }
    } catch(error){
        return {
            status: 500,
            body: (error as Error).message
        }
        // TODO
    }
}
