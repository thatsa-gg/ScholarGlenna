import { error, redirect, type RequestHandler } from '@sveltejs/kit'
import { authorizeUser } from '$lib/server/auth'
import { createSession } from '$lib/server/session'
import { cache } from '$lib/server'

// runs when Discord sends the user back to us after logging in.
export const GET = (async ({ cookies, url }) => {
    // Make sure the log-in was successful
    const code = url.searchParams.get('code')
    if(!code)
        throw error(400, `Missing authorization code.`)

    // and that it's for a request that we sent
    const state = url.searchParams.get('state')
    if(!state)
        throw error(400, `Missing state.`)

    // (if it is, it'll exist in the cache with a redirect URI)
    const returnUrl = await cache.client.getdel(`oauth2state:${state}`)
    if(!returnUrl)
        throw error(400, `Invalid state.`)

    // reach out to Discord again to get the API token
    const authorization = await authorizeUser(code, state)

    // and save it to a new session
    const session = await createSession(authorization)

    // then let the user know what their session is
    cookies.set('session_id', session.id, {
        path: '/',
        expires: session.expiration
    })

    // and send them back to where they were.
    throw redirect(302, returnUrl)
}) satisfies RequestHandler
