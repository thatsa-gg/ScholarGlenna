import { listener } from '../EventListener'
import { registerCommands } from '../commands'
import { DISCORD_TOKEN, OAUTH_CLIENT_ID } from '../config'
import { log, info } from 'console'

export default listener('guildCreate', {
    async execute(guild){
        log(`Joining guild "${guild.name}" (${guild.id})`)
        // TODO: fetch and store guild and member data
        log(`Registering commands on "${guild.name}" (${guild.id})`)
        await registerCommands({
            token: DISCORD_TOKEN,
            clientId: OAUTH_CLIENT_ID,
            guildId: guild.id
        })
        await guild.systemChannel?.send({
            content: "Glenna is initialized!" // TODO: better initialized message.
        })
        info(`Joined guild "${guild.name}" (${guild.id}).`)
    }
})
