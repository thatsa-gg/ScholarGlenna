import { redirect } from "@sveltejs/kit"
import { Http, AppUrl } from "$lib/server"

export async function GET({ params }){
    redirect(Http.Code.PermanentRedirect, AppUrl.guild(params.guild))
}
