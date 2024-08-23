import { json } from "@sveltejs/kit"
import { Discord } from "$lib/server"
import { App, Guild } from "$lib/server/database"
import { isGuildMemberWithUser } from "$lib/server/discord"
import { Synchronize } from "$lib/server/database/helpers/synchronize"

export async function GET({ url, locals }){
    // TODO: verify access token

    // prep
    const { connection } = locals
    await Synchronize.Prepare(connection)

    // the guilds Glenna is part of
    const limit = 200
    let after: string | undefined = undefined
    do {
        const guilds = await Discord.Api.users.getGuilds({ limit, after })
        await Synchronize.MarkGuildsActive(connection, guilds)
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
    await Synchronize.MarkInactiveGuilds(connection)
    await Synchronize.PruneOldGuilds(connection)

    // TODO: better response
    return json({ status: "ok" })
}
