import { Database } from '@glenna/common'
import { type RequestHandler, error, redirect } from '@sveltejs/kit'

export const GET: RequestHandler = async (event) => {
    const { guild_id: alias } = event.params
    if(!alias)
        throw error(404)
    const guild = await Database.Client.guild.findUnique({ where: { alias }, select: { alias: true }})
    if(!guild)
        throw error(404)
    throw redirect(301, `/g/${guild.alias}`)
}
