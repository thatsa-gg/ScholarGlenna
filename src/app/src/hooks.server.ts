import type { Handle } from '@sveltejs/kit'
import { getUserSessionData } from '$lib/server/user'

export const handle = (async ({ event, resolve }) => {
    event.locals.session = await getUserSessionData(event.cookies.get('session_id'))
    return await resolve(event)
}) satisfies Handle
