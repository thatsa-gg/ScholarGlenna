import { error } from "@sveltejs/kit"
import { AppUrl } from "$lib/server/url.js"
import { Http } from "$lib/server/http.js"

export async function load({ locals: { session }, params }){
    if(!session)
        return error(Http.Code.Unauthorized)
    const section = params.section == "builds" ? "Builds"
                  : params.section == "accounts" ? "Accounts"
                  : "Settings"
    return {
        pageSection: params?.section ?? null,
        context: [
            { name: `@${session.user.name}`, href: AppUrl.user(session.user) },
            { name: section }
        ]
    }
}
