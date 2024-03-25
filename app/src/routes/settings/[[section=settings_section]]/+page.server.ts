import { error } from "@sveltejs/kit"
import { AppUrl } from "$lib/server/url.js"
import { Http } from "$lib/server/http.js"
import { handleBuildForm } from "./(builds)/form.js"

export async function load({ locals: { session }, params }){
    if(!session)
        return error(Http.Code.Unauthorized)
    const section = params.section == "builds" ? "Builds"
                  : params.section == "accounts" ? "Accounts"
                  : "Settings"
    const title = params.section == "builds" ? "Settings - Builds"
                : params.section == "accounts" ? "Settings - Accounts"
                : "Settings"
    return {
        pageSection: params?.section ?? null,
        title,
        context: [
            { name: `@${session.user.name}`, href: AppUrl.user(session.user) },
            { name: section }
        ]
    }
}

export const actions = {
    async default({ locals, request }){
        if(!locals.session)
            throw error(403)

        const data = await request.formData()
        const form = data.get("form-id")?.toString().toLowerCase()
        switch(form){
            case "builds": return handleBuildForm(locals, data)
            default:
                throw error(400)
        }
    }
}
