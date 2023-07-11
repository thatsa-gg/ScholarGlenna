import type { LayoutServerLoad } from "./$types"
import { database } from "$lib/server"
import { error } from "@sveltejs/kit"
import { permissionFragment } from "@glenna/prisma"

export const load = (async ({ params, locals }) => {
    const guild = await database.guild.findUnique({
        where: {
            alias: params.guild,
            permission: {
                read: permissionFragment(locals.session?.user)
            }
        },
        select: {
            name: true,
            alias: true,
            teams: {
                orderBy: { name: 'asc' },
                select: {
                    name: true,
                    alias: true
                }
            }
        }
    })

    if(!guild)
        throw error(404)

    return {
        context: [
            { name: guild.name, href: `/${guild.alias}` }
        ],
        guild: {
            name: guild.name,
            alias: guild.alias,
            teams: guild.teams.map(team => ({
                name: team.name,
                alias: team.alias,
            })),
        }
    }
}) satisfies LayoutServerLoad
