import type { RequestHandler } from '@sveltejs/kit'
import { unauthorized } from '$lib/status'
import { AppDataSource } from '@glenna/common'

export const get: RequestHandler = async event => {
    const user = event.locals.user
    if(!user) return unauthorized();

    const { Guilds } = await AppDataSource
    const guilds = await Guilds.getForUser(user.user_id)

    return {
        status: 200,
        body: {
            guilds: guilds.map(guild => guild.json())
        }
    }
}
