import { listener } from '../EventListener.js'
import { DISCORD_TOKEN, OAUTH_CLIENT_ID, VERSION } from '../config.js'
import { info, log } from 'console'
import { start } from '@glenna/util'
import { registerCommands } from '../commands.js'
import { updateStatus } from '../status.js'

export default listener('ready', {
    once: true,
    async execute(client){
        info('Beginning startup...')
        client.setMaxListeners(Infinity)
        client.user.setActivity(`Starting up v.${VERSION}`)
        await client.user.setUsername('ScholarGlenna')

        info('Registering commands...')
        const guilds = client.guilds.cache.map(g => g)
        for(const { id, name } of guilds){
            log(`\tRegistering commands on: ${name}`)
            await registerCommands({
                token: DISCORD_TOKEN,
                clientId: OAUTH_CLIENT_ID,
                guildId: id
            })
        }

        info('Initializing status...')
        start(updateStatus(client.user))

        info('Startup complete!')
    }
})
