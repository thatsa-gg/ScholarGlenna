import type { LayoutServerLoad } from "./$types"
import { database } from "$lib/server"
import { error } from "@sveltejs/kit"

export const load = (async ({ parent, params }) => {
    const user = await database.user.findUnique({
        where: {
            alias: params.user,
            NOT: {
                profile: null
            }
        },
        select: {
            name: true,
            alias: true,
            profile: {
                select: {
                    visibility: true,
                    isVisible: true
                }
            }
        }
    })

    if(!user)
        throw error(404)

    const data = await parent()

    // this returns 404 so people can't figure out which users are on the platform so easily
    if(!user.profile!.isVisible(data.user))
        return error(404)

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
