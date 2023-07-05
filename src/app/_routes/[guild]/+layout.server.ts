import type { LayoutServerLoad } from './$types'
import { database } from '$lib/server'
import { redirectAuth } from '$lib/server/auth'
import { error } from '@sveltejs/kit'

export const load: LayoutServerLoad = async ({ parent, params, url }) => {
    const data = await parent()
    const guild = await database.guild.findFirst({
        where: {
            alias: params.guild,
            lostRemoteReferenceAt: null,
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
    if(!await guild.isAuthorized([ "read" ], data.user)){
        if(data.user)
            // signed in, you don't have permission
            throw error(403)
        else
            // not signed in, you *might* have permission if you do
            throw await redirectAuth(url)
    }

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
            manager: await guild.isAuthorized([ "managers" ], data.user),
            update: await guild.isAuthorized([ "update" ], data.user),
            createTeam: await guild.isAuthorized([ "createTeam" ], data.user),
        }
    }
}
