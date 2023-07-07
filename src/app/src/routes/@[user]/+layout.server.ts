import type { LayoutServerLoad } from "./$types"
import { database } from "$lib/server"
import { error } from "@sveltejs/kit"

export const load = (async ({ parent, params, locals }) => {
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

    // this returns 404 so people can't figure out which users are on the platform so easily
    if(!await user.profile!.isVisible(locals.session?.user))
        throw error(404)

    const data = await parent()
    return {
        ...data,
        context: [
            { name: user.name, href: `/@${user.alias}` }
        ],
        params: {
            user: {
                name: user.name,
                alias: user.alias
            }
        }
    }
}) satisfies LayoutServerLoad
