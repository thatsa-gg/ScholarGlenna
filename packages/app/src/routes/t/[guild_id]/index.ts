import { notFound } from '$lib/status'
import { Database } from '@glenna/common'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async (event) => {
    const { guild_id: alias } = event.params
    if(!alias)
        return notFound()
    const guild = await Database.Client.guild.findUnique({ where: { alias }, select: { alias: true }})
    if(!guild)
        return notFound()
    return {
        status: 301,
        headers: {
            Location: `/g/${guild.alias}`
        }
    }
}
