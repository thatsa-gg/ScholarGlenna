import type { PageServerLoad } from "./$types"
import { redirect } from "@sveltejs/kit"
import { AppUrl } from "$lib/server"

/** @type {PageServerLoad}  */
export async function load({ locals }){
    const { session } = locals
    if(session)
        return redirect(302, AppUrl.user(session.user))
    return {
        context: [
            {
                name: "Scholar Glenna",
                href: "/"
            }
        ]
    }
}
