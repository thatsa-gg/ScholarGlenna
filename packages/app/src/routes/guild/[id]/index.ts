import type { RequestHandler } from '@sveltejs/kit'
import { AppDataSource } from '@glenna/common'
import { notFound } from '$lib/status'

export const get: RequestHandler = async event => {
    const user = event.locals.user ?? false
    const alias = event.params['id']
    if(!alias)
        return notFound()
    const { Guilds } = await AppDataSource
    const guild = await Guilds.lookup(alias)
    if(!guild)
        return notFound()
    return {
        status: 200,
        body: {
            user,
            guild: guild.json()
        }
    }
}
