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
        for(const guild of guilds){
            const entity = await AppDataSource.Guilds.updateOrRestore(guild, { create: true })
            log(`\tUpdating server import for: ${entity.name}`)
            await AppDataSource.Guilds.import(entity, guild)
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
