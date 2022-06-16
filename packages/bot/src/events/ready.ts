import { listener } from '../EventListener'
import { DISCORD_TOKEN, OAUTH_CLIENT_ID, VERSION } from '../config'
import { info, log } from 'console'
import { start } from '@glenna/util'
import { registerCommands } from '../commands'
import { updateStatus } from '../status'

export default listener('ready', {
    once: true,
    async execute(client){
        log('Beginning startup...')
        client.setMaxListeners(Infinity)
        client.user.setActivity(`Starting up v.${VERSION}`)
        await client.user.setUsername('ScholarGlenna')

        log('Registering commands...')
        const guilds = client.guilds.cache.map(g => g)
        for(const { id, name } of guilds){
            info(`\tRegistering commands on: ${name}`)
            await registerCommands({
                token: DISCORD_TOKEN,
                clientId: OAUTH_CLIENT_ID,
                guildId: id
            })
        }

        log('Initializing status...')
        start(updateStatus(client.user))

        log('Startup complete!')
    }
})
