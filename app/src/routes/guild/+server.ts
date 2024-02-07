import { Http } from "$lib/server";
import { ClientAppUrl } from "$lib/url";
import { redirect } from "@sveltejs/kit";

export function GET(){
    return redirect(Http.Code.PermanentRedirect, ClientAppUrl.Guilds)
}
