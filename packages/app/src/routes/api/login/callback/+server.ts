import type { RequestHandler } from '@sveltejs/kit'
import { authorizeUser } from '$lib/auth'
import { createSession } from '$lib/session'

type Params = {
    code: string
}
export const GET: RequestHandler<Params> = async event => {
    const query = event.url.searchParams
    const code = query.get('code') ?? null
    try {
        const authorization = await authorizeUser(code)
        const session = await createSession(authorization)
        return {
            status: 302,
            headers: {
                Location: '/',
                'Set-Cookie': [
                    `session_id=${session.id}; Path=/; HttpOnly; SameSite=Lax; Expires=${session.expiration}`
                ]
            }
        }
    } catch(error){
        return {
            status: 500,
            body: JSON.stringify({
                error: error instanceof Error ? error.message: error,
                trace: error instanceof Error ? error.stack : null
            })
        }
    }
}
