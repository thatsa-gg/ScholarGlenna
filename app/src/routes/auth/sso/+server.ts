import { redirect, type RequestHandler } from "@sveltejs/kit"
import { Auth, Http } from "$lib/server"
import { z } from 'zod'

const validateUrl = z.string().regex(/\/.*/).catch("/").default("/")

// used when people try to log in
// redirect_uri is an optional parameter to send people back where they came from
// (default is the dashboard)
/** @type {RequestHandler} */
export async function GET({ url }){
    const param = url.searchParams.get("redirect_uri") ?? ""
    const returnTo = validateUrl.parse(decodeURIComponent(param))
    return redirect(Http.Code.FoundElsewhere, await Auth.redirect(returnTo))
}
