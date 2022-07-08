import type { RequestHandler } from '@sveltejs/kit'
import { AppDataSource } from '@glenna/common'

export const get: RequestHandler = async event => {
    const user = event.locals.user ?? false
    const { Guilds } = await AppDataSource
    const guilds = !user ? [] : await Guilds.getForUser(user.user_id).then(a => a.map(b => b.json()))
    return {
        status: 200,
        body: {
            user, guilds
        }
    }
}
