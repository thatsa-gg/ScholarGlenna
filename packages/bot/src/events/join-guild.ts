import { listener } from '../EventListener.js'
import { registerCommands } from '../commands.js'
import { DISCORD_TOKEN, OAUTH_CLIENT_ID } from '../config.js'
import { log, info } from 'console'
import { Database } from '@glenna/common'
import { TextChannel } from 'discord.js'

export default listener('guildCreate', {
    async execute(guild){
        log(`Joining guild: "${guild.name}" (${guild.id})`)
        const entity = await Database.Guilds.import(guild)
        log(`Created guild: ${entity.guild_id} = ${entity.snowflake}`)
        log(`Registering commands on "${guild.name}" (${guild.id})`)
        await registerCommands({
            token: DISCORD_TOKEN,
            clientId: OAUTH_CLIENT_ID,
            guildId: entity.snowflake
        })
        const self = await guild.members.fetchMe()
        const channel = guild.systemChannel ?? guild.channels.cache
            .filter(channel => channel instanceof TextChannel && !channel.isThread() && channel.permissionsFor(self).has('SendMessages'))
            .at(0) as TextChannel | undefined
        await channel?.send({
            content: "Glenna is initialized!" // TODO: better initialized message.
        })
        info(`Joined guild "${guild.name}" (${guild.id}).`)
    }
})
