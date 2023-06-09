import type { PageServerLoad } from './$types'
import { database } from '$lib/server'
import { permissionFragment } from '@glenna/prisma'

export const load: PageServerLoad = async ({ parent }) => {
    const data = await parent()
    const teams = await database.team.findMany({
        where: {
            guildId: data.guild.id,
            permission: {
                read: permissionFragment(data.user.id)
            }
        },
        select: {
            id: true,
            alias: true,
            name: true,
            capacity: true,
            focus: true,
            level: true,
            icon: true,
            region: true,
            type: true,
            _count: {
                select: {
                    members: true
                }
            }
        }
    })
    // TODO: merge readTime into read permission to avoid unnecessary extra queries
    return {
        ...data,
        teams: teams.map(team => ({
            id: team.id,
            name: team.name,
            capacity: team.capacity,
            members: team._count.members,
            region: team.region,
            focus: team.focus,
            level: team.level,
            type: team.type,
            alias: team.alias,
        }))
    }
}
