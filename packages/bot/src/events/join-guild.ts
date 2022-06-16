import { listener } from '../EventListener'
import { registerCommands } from '../commands'
import { DISCORD_TOKEN, OAUTH_CLIENT_ID } from '../config'
import { log } from 'console'

export default listener('guildCreate', {
    async execute(guild){
        log(`Joining guild "${guild.name}" (${guild.id})`)
        // TODO: fetch and store guild and member data
        await registerCommands({
            token: DISCORD_TOKEN,
            clientId: OAUTH_CLIENT_ID,
            guildId: guild.id
        })
        await guild.systemChannel?.send({
            content: "Glenna is initialized!" // TODO: better initialized message.
        })
    }
})
