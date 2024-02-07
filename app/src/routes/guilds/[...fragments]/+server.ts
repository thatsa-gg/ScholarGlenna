import { Http } from "$lib/server/http.js"
import { redirect } from "@sveltejs/kit"

// This is here in case people type the wrong thing
export function GET({ params }){
    return redirect(Http.Code.PermanentRedirect, `/guild/${params.fragments}`)
}
