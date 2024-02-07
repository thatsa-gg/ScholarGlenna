import { Auth, Cache, Database, Discord, Http, Session, User } from "$lib/server"
import { Guild } from "$lib/server/database/guild.js"
import { GuildMember } from "$lib/server/database/guildmember.js"
import { Role } from "$lib/server/database/role.js"
import {
    redirect,
    error,
    type RequestHandler
} from "@sveltejs/kit"

/** @type {RequestHandler} */
export async function GET({ locals, cookies, url }){
    // Make sure the log-in was successful
    const code = url.searchParams.get("code")
    if(!code)
        return error(Http.Code.Unauthorized, "Missing authorization code.")

    // and that it's for a request that we sent
    const state = url.searchParams.get("state")
    if(!state)
        return error(Http.Code.Unauthorized, "Missing state.")

    // (if it is, it'll exist in the cache with a redirect URI)
    const cache = locals.cache
    const returnUrl = await cache.getdel(Cache.Key.oauth2Request(state))
    if(!returnUrl)
        return error(Http.Code.Unauthorized, "Invalid state.")

    // reach out to Discord again to get the API token
    const authorization = await Auth.authorizeUser(code, state)

    // and save it to a new session
    const session = await Session.create(locals.connection, cache, authorization)

    // then let the user know what their session is
    cookies.set("session_id", session.id, {
        path: "/",
        expires: session.expiration
    })

    // update what guilds they're a part of
    const api = Discord.User(authorization)
    const guilds: Glenna.Id.Guild[] = []
    for(const guild of await api.users.getGuilds()){
        const dbGuild = await Guild.get(locals.connection, guild)
        if(dbGuild){
            guilds.push(dbGuild)
            const member = await api.users.getGuildMember(guild.id)
            await GuildMember.createOrUpdate(locals.connection, dbGuild, session, member)
        }
    }
    await Role.synchronizeGuildMemberRolesForProfile(locals.connection, session, guilds)

    // and send them back to where they were.
    return redirect(Http.Code.FoundElsewhere, returnUrl)
}
