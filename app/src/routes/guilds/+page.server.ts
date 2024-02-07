import { Guild } from "$lib/server/database"

export async function load({ locals: { session, connection }}){
    return {
        guilds: await Guild.getVisible(connection, session?.user ?? null),
        context: [
            { name: "Scholar Glenna", href: "/" },
            { name: "Guilds" }
        ]
    }
}
