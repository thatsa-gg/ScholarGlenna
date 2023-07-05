import type { PageServerLoad } from './$types'
import { database } from '$lib/server'
import { permissionFragment, type Guild } from '@glenna/prisma'
import z from 'zod'
import { searchParamsAsObject } from '$lib/util'

const validateParams = z.union([
    z.object({
        sort: z.literal('name'),
        after: z.string().optional()
    }),
    z.object({
        sort: z.literal('id').optional(),
        after: z.coerce.number().int().min(0).optional()
    })
])

export const load: PageServerLoad = async ({ parent, url }) => {
    const data = await parent()
    const search = validateParams.parse(searchParamsAsObject(url.searchParams))
    const guilds = await database.guild.findMany({
        where: {
            lostRemoteReferenceAt: null,
            permission: {
                read: permissionFragment(data.user?.id ?? null)
            },
            ... search.after !== undefined && search.sort === 'id' ? { id: { gt: search.after }}
              : search.after !== undefined && search.sort === 'name' ? { name: { gt: search.after }}
              : {}
        },
        orderBy: { [search.sort ?? 'id']: 'asc' },
        select: {
            alias: true,
            name: true,
        }
    })
    return {
        ...data,
        guilds
    }
}
