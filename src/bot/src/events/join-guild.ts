import { listener } from '../EventListener.js'
import { registerCommands } from '../commands/index.js'
import { DISCORD_TOKEN, OAUTH_CLIENT_ID } from '../config.js'
import { info, debug } from '../util/logging.js'
import { database } from '../util/database.js'
import { sendWelcomeMessage } from '../util/guild.js'

export const joinGuildListener = listener('guildCreate', {
    async execute(guild){
        info(`Joining guild: "${guild.name}" (${guild.id})`)
        await database.guild.import({
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            vanity_url_code: guild.vanityURLCode
        }, await guild.fetchOwner())

        debug(`Registering commands on "${guild.name}" (${guild.id})`)
        await registerCommands({
            token: DISCORD_TOKEN,
            clientId: OAUTH_CLIENT_ID,
            guildId: guild.id
        })

        debug(`Sending welcome message.`)
        await sendWelcomeMessage(guild)
    }
})
