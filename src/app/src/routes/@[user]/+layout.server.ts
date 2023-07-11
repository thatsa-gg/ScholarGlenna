import type { LayoutServerLoad } from "./$types"
import { database } from "$lib/server"
import { error } from "@sveltejs/kit"

export const load = (async ({ params, locals }) => {
    const profile = await database.user.findUnique({
        where: {
            alias: params.user,
            NOT: {
                profile: null
            }
        },
        select: {
            name: true,
            alias: true,
            avatar: true,
            profile: {
                select: {
                    visibility: true,
                    isVisible: true
                }
            }
        }
    })

    if(!profile)
        throw error(404)

    // this returns 404 so people can't figure out which users are on the platform so easily
    if(!await profile.profile!.isVisible(locals.session?.user))
        throw error(404)

    return {
        context: [
            { name: profile.name, href: `/@${profile.alias}` }
        ],
        params: {
            currentUser: {
                alias: locals.session?.user.alias
            },
            profile: {
                name: profile.name,
                alias: profile.alias,
                avatar: profile.avatar
            }
        }
    }
}) satisfies LayoutServerLoad
