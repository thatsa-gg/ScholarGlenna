/*import { AjvParseError, BigIntParseError } from '$lib/api/ajv'
import { parse } from '$lib/api/teams'
import { Discord } from '$lib/discord'
import { notFound, unauthorized, forbidden } from '$lib/status'
import { Database } from '@glenna/common'
import type { RequestHandler } from './__types/submit'

export const POST: RequestHandler = async event => {
    try {
        const user = event.locals.user
        const data = parse(await event.request.text())
        const guild = await Database.Client.guild.findUnique({
            where: { alias: event.params.guild_id.toLowerCase() },
            select: { guild_id: true, snowflake: true }
        })
        if(!guild)
            return notFound()
        if(!user)
            return unauthorized()
        if(!await Database.Authorization.teamCreate(user, guild))
            return forbidden()
        const discordGuild = await Discord.guilds.fetch(guild.snowflake.toString())
        const [ success, messages ] = await Database.Teams.isValid(data, discordGuild, guild)
        if(!success && messages.length === 0)
            messages.push(`Unknown error occurred during validation.`)
        if(!success || event.url.searchParams.has('validate')){
            return {
                status: 200,
                body: { success, messages, team: null }
            }
        }
        const team = await Database.Teams.create(data, discordGuild, guild)
        if(!team)
            return { status: 500 }
        return {
            status: 200,
            body: {
                success: true,
                messages: [],
                team: {
                    uri: `/t/${event.params.guild_id}/${team.alias}`
                }
            }
        }
    } catch(error){
        console.error(error)
        if(error instanceof AjvParseError){
            return {
                status: 200,
                body: {
                    success: false,
                    messages: [ error.message ],
                    team: null
                }
            }
        }
        if(error instanceof BigIntParseError){
            return {
                status: 200,
                body: {
                    success: false,
                    messages: [ `${error.property} is not a valid reference.` ],
                    team: null
                }
            }
        }
        return {
            status: 500,
            body: {
                success: false,
                messages: (error as any).toString(),
                team: null
            }
        }
    }
}
*/
