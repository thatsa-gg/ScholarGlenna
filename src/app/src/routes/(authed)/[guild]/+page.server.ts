import { database } from '$lib/server'
import { permissionFragment } from '@glenna/prisma'
import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ parent, params }) => {
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
            alias: true,
            name: true,
            icon: true,
            acronym: true,
            statistics: {
                select: {
                    uniqueTeamMembers: true
                }
            },
        }
    })

    if(!guild)
        throw error(404)
    return {
        ...data,
        guild
    }
}
