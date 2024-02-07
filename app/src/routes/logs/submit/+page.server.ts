import type { PageServerLoad } from "./$types"
import { error } from "@sveltejs/kit"
import { Http } from "$lib/server"

/** @type {PageServerLoad} */
export async function load({ locals: { session } }){
    if(null == session)
        return error(Http.Code.Unauthorized, "You must sign in to submit logs.")
    // TODO
}
