import type { RequestHandler } from "@sveltejs/kit"

export const GET = (async () => {
    return new Response(JSON.stringify({
        status: 'ok',
        time: Date.now()
    }))
}) satisfies RequestHandler
