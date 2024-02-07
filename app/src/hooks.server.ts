import type { Handle } from "@sveltejs/kit"
import { User, Cache, Database, initialize } from "$lib/server"
import { building } from "$app/environment"

// Perform conditional static initialization
await initialize(building)

const StatelessPaths = new Set<string>([
])

function isStateless(url: URL){
    return StatelessPaths.has(url.pathname) ||
        url.pathname.startsWith("/auth/") ||
        url.pathname.startsWith("/api/") ||
        url.pathname.startsWith("/links/")
}

/** @type {Handle} */
export async function handle({ event, resolve }){
    // database/cache connections to use for this request
    const connection = Database.get()
    const cache = Cache.get()
    event.locals.connection = connection
    event.locals.cache = cache

    // session info
    if(isStateless(event.url)){
        event.locals.session = null
    } else {
        const sessionCookie = event.cookies.get('session_id')
        event.locals.session = await User.lookupSession(cache, connection, sessionCookie)
    }

    // resolve the request
    return resolve(event)
}
