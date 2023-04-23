import { database } from '$lib/server'
import { permissionFragment } from '@glenna/prisma'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
    const data = await parent()
    const guilds = await database.guild.findMany({
        where: {
            members: { some: { user: { id: data.user.id }}}
        },
        select: {
            alias: true,
            acronym: true,
            icon: true,
            name: true,
            teams: {
                // all teams the user can see
                where: { permission: { read: permissionFragment(data.user.id) }},
                select: {
                    alias: true,
                    name: true,
                    capacity: true,
                    _count: {
                        select: {
                            members: true
                        }
                    },
                    members: {
                        // if this user is a member of the team, select their role.
                        where: { member: { user: { id: data.user.id }}},
                        select: { role: true }
                    }
                }
            }
        }
    })
    return {
        ...data,
        guilds
    }
}
