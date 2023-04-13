import { database } from '$lib/server'
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
                where: { members: { some: { member: { user: { id: data.user.id }}}}},
                select: {
                    alias: true,
                    name: true,
                    capacity: true,
                    _count: {
                        select: {
                            members: true
                        }
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
