import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async() => ({
    status: 302,
    headers: {
        Location: '/',
        'set-cookie': [
            `access_token=deleted; Path=/; Max-Age=-1`,
            `refresh_token=deleted; Path=/; Max-Age=-1`,
        ]
    }
})
