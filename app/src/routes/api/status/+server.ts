import type { RequestHandler } from "./$types"
import { json } from "@sveltejs/kit"

/** @type {RequestHandler} */
export async function GET({ url, locals }){
    return json({ status: "ok" })
}
