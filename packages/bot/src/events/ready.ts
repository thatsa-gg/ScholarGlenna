import { listener } from '../EventListener.js'
import { DISCORD_TOKEN, OAUTH_CLIENT_ID, VERSION } from '../config.js'
import { info, log } from 'console'
import { registerCommands } from '../commands.js'
import { AppDataSource } from '../index.js'

export default listener('ready', {
    once: true,
    async execute(client){
        info('Beginning startup...')
        client.setMaxListeners(Infinity)
        client.user.setActivity(`Starting up v.${VERSION}`)
        await client.user.setUsername('ScholarGlenna')

        info('Registering commands...')
        const guilds = client.guilds.cache.map(g => g)
        log(`\tCleaning up old guilds...`)
        log()
        log(`\tID        Snowflake           Name`)
        log(`\t----------------------------------------`)
        const deletedGuilds = await AppDataSource.Guilds.delete({ except: Array.from(client.guilds.cache.keys()) })
        if(deletedGuilds.length === 0)
            log(`\t(none)`)
        else for(const guild of deletedGuilds)
            log(`\t${guild.id.toString().padEnd(9)} ${guild.snowflake.padEnd(19)} ${guild.name}`)
        log()
        for(const guild of guilds){
            log(`\tUpdating server import for: ${guild.name}`)
            const entity = await AppDataSource.Guilds.import(guild)
            log(`\tRegistering commands on: ${entity.name}`)
            await registerCommands({
                token: DISCORD_TOKEN,
                clientId: OAUTH_CLIENT_ID,
                guildId: entity.snowflake
            })
        }

        //info('Initializing status...')
        //start(updateStatus(client.user))

        info('Startup complete!')
    }
})
