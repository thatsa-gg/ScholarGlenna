import type { RequestHandler } from "./$types"
import { json } from "@sveltejs/kit"
import { Discord } from "$lib/server"
import { App, Guild } from "$lib/server/database"
import { isGuildMemberWithUser } from "$lib/server/discord"

/** @type {RequestHandler} */
export async function GET({ url, locals }){
    // TODO: verify access token

    // prep
    const { connection } = locals
    await App.prepareSynchronize(connection)

    // the guilds Glenna is part of
    const limit = 200
    let after: string | undefined = undefined
    do {
        const guilds = await Discord.Api.users.getGuilds({ limit, after })
        await App.markActiveGuild(connection, guilds)
        for(const entry of guilds){
            // init each guild one by one
            const guild = await Discord.Api.guilds.get(entry.id)
            const owner = await Discord.Api.guilds.getMember(guild.id, guild.owner_id)

            if(!isGuildMemberWithUser(owner))
                throw "retrieved owner without user info!"
            // will update teams/members if necessary
            await Guild.createOrUpdate(connection, guild, owner)
        }

        // loop if there are any to -- there will always be one extra request
        after = guilds.at(-1)?.id
    } while(after)

    // close out the old guilds
    await App.markInactiveGuilds(connection)
    await App.cleanupOldGuilds(connection)

    // TODO: better response
    return json({ status: "ok" })
}
