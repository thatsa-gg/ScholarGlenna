import { listener } from '../EventListener.js'
import { registerCommands } from '../commands.js'
import { DISCORD_TOKEN, OAUTH_CLIENT_ID } from '../config.js'
import { log, info } from 'console'
import { AppDataSource } from '../index.js'

export default listener('guildCreate', {
    async execute(guild){
        log(`Joining guild: "${guild.name}" (${guild.id})`)
        const guildEntity = await AppDataSource.Guilds.findOrCreate(guild)
        log(`Created guild: ${guildEntity.id} = ${guildEntity.snowflake}`)
        await AppDataSource.Guilds.import(guildEntity, guild)
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
