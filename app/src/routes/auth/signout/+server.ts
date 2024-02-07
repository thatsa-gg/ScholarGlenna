// sign out
import { redirect, type RequestHandler } from "@sveltejs/kit"
import { Http, Session } from "$lib/server"

/** @type {RequestHandler} */
export async function GET({ cookies, locals }){
    // find the cookie
    const sessionId = cookies.get("session_id")

    // if there is one, delete any associated session and the attached API tokens
    if(sessionId)
        await Session.destroy(locals.cache, sessionId)

    // purge the cookie
    cookies.delete("session_id", {
        path: "/",
        httpOnly: true,
        sameSite: "lax"
    })

    // just send them back to the main page when they log out
    return redirect(Http.Code.FoundElsewhere, "/")
}
