import type { LayoutServerLoad } from "./$types"
import { database } from "$lib/server"
import { error } from "@sveltejs/kit"

export const load = (async ({ locals }) => {
    // we can throw 403 for this route, they're not signed in.
    if(!locals.session?.profile)
        throw error(403)

    const profile = await database.profile.findUniqueOrThrow({
        where: {
            id: locals.session.profile.id
        },
        select: {
            user: {
                select: {
                    name: true,
                    alias: true,
                    avatar: true
                }
            }
        }
    })

    // users can always see their own profile, and have no way
    // to access profiles for anyone else, so no need to check
    // visibility here.

    return {
        context: [
            { name: profile.user.name, href: `/@${profile.user.alias}` }
        ],
        params: {
            currentUser: {
                alias: locals.session.user.alias
            },
            profile: {
                name: profile.user.name,
                alias: profile.user.alias,
                avatar: profile.user.avatar
            }
        }
    }
}) satisfies LayoutServerLoad
