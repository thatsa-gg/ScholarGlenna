import { error } from "console"
import type { LayoutServerLoad } from "./$types"

export const load = (async ({ parent, locals, params }) => {
    // security 👍
    if(locals.session?.user.alias !== params.user)
        throw error(404)
    return await parent()
}) satisfies LayoutServerLoad
