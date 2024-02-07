import { error } from "@sveltejs/kit"
import { Http } from "$lib/server"

export async function load({ locals: { session } }){
    if(null == session)
        return error(Http.Code.Unauthorized, "You must sign in view your team applications.")
    // TODO
}
