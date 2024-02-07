import { error, redirect } from "@sveltejs/kit"
import { AppUrl, Http } from "$lib/server"

export async function GET({ locals: { session }}){
    if(!session)
        return error(Http.Code.Unauthorized)
    return redirect(Http.Code.FoundElsewhere, AppUrl.user(session.user))
}
