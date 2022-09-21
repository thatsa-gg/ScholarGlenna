import { error, redirect } from '@sveltejs/kit'
import { Database } from '@glenna/common'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
    const { guild_alias: alias } = params
    const guild = await Database.Client.guild.findUnique({ where: { alias }, select: null })
    if(!guild)
        throw error(404)
    throw redirect(303, `/guild/${alias}`)
}
