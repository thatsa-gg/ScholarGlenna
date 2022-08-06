import { Discord } from '$lib/discord'
import { Database } from '@glenna/common'
import type { RequestHandler } from './__types/submit'

export const POST: RequestHandler = async event => {
    const data = await event.request.json()
    const guild = await Database.Client.guild.findUnique({
        where: { alias: event.params.guild_id.toLowerCase() },
        select: { guild_id: true, snowflake: true }
    })
    if(!guild)
        return { status: 404 }
    const discordGuild = await Discord.guilds.fetch(guild.snowflake.toString())
    const [ success, messages ] = await Database.Teams.isValid(data, discordGuild, guild)
    if(!success || event.url.searchParams.has('validate')){
        return {
            status: 200,
            body: { success, messages, team: null }
        }
    }
    try {
        const team = await Database.Teams.create(data, discordGuild, guild)
        if(!team)
            return { status: 500 }
        return {
            status: 200,
            body: { success: true, messages: [], team }
        }

    } catch(e){
        // TODO: error
        return {
            status: 500
        }
    }
}
