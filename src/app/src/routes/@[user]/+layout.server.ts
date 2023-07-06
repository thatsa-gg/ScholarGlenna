import type { LayoutServerLoad } from "./$types"
import { database } from "$lib/server"
import { error } from "@sveltejs/kit"

export const load = (async ({ parent, params }) => {
    const user = await database.user.findUnique({
        where: { alias: params.user },
        select: {
            name: true,
            alias: true,
        }
    })

    if(!user)
        throw error(404)

    const data = await parent()
    return {
        ...data,
        params: {
            user: {
                name: user.name,
                alias: user.alias
            }
        }
    }
}) satisfies LayoutServerLoad
