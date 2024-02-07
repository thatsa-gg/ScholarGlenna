import { AppUrl } from "$lib/server"

export async function load({ locals: { session } }){
    if(!session){
        return {
            sessionUser: null
        }
    }
    return {
        sessionUser: {
            name: session.user.name,
            url: {
                user: AppUrl.user(session.user),
                avatar: AppUrl.Discord.avatar(session.user),
                logs: AppUrl.userLogs(session.user),
            },
            guilds: []
        } satisfies Glenna.ClientSessionUser,
        context: [
            // Default Context
            {
                name: "Scholar Glenna"
            }
        ]
    }
}
