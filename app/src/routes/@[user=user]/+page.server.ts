import { error } from "@sveltejs/kit"
import { Users } from "$lib/server/database"
import { AppUrl } from "$lib/server"

export async function load({ locals: { connection }, params }){
    const user = await Users.FindByName(connection, params.user)
    if(!user)
        return error(404, `User not found: ${params.user}`)
    return {
        user: {
            name: user.name,
            url: {
                user: AppUrl.user(user),
                avatar: AppUrl.Discord.avatar(user),
                logs: AppUrl.userLogs(user),
            }
        } satisfies Glenna.User,
        logs: [],
        context: [
            { name: `@${user.name}` }
        ]
    }
}
