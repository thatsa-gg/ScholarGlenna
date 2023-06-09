import { database } from '$lib/server'
import { permissionFragment } from '@glenna/prisma'
import type { LayoutServerLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load: LayoutServerLoad = async ({ parent, params, url }) => {
    const data = await parent()
    const guild = await database.guild.findFirst({
        where: {
            alias: params.guild,
            lostRemoteReferenceAt: null,
            permission: {
                read: permissionFragment(data.user.id)
            }
        },
        select: {
            isAuthorized: true,
            id: true,
            alias: true,
            name: true,
            icon: true,
            acronym: true,
            statistics: {
                select: {
                    uniqueTeamMembers: true
                }
            }
        }
    })

    if(!guild)
        throw error(404)

    const user = { snowflake: data.user.snowflake }
    return {
        ...data,
        guild: {
            id: guild.id,
            alias: guild.alias,
            name: guild.name,
            icon: guild.icon,
            acronym: guild.acronym,
            statistics: guild.statistics,
        },
        permissions: {
            read: true,
            manager: guild.isAuthorized([ "managers" ], user),
            update: guild.isAuthorized([ "update" ], user),
            createTeam: guild.isAuthorized([ "createTeam" ], user),
        }
    }
}
