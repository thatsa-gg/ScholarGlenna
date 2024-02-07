import { AppUrl, Http } from "$lib/server"
import { error, redirect } from "@sveltejs/kit"

export async function GET({ locals: { session } }){
    if(null == session)
        return error(Http.Code.Unauthorized, "You must sign in to view your logs.")
    return redirect(Http.Code.FoundElsewhere, AppUrl.userLogs(session.user))
}
