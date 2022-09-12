import { listener } from '../EventListener.js'
import { DISCORD_TOKEN, OAUTH_CLIENT_ID, VERSION } from '../config.js'
import { info, log } from 'console'
import { registerCommands } from '../commands.js'
import { Database } from '@glenna/common'

export default listener('ready', {
    once: true,
    async execute(client){
        info('Beginning startup...')
        client.setMaxListeners(Infinity)
        client.user.setActivity(`Starting up v.${VERSION}`)

        info('Importing guilds...')
        const guilds = await Database.Guilds.import([...client.guilds.cache.values()], { replace: true })

        log()
        log('Guilds marked for deletion are:')
        log(`\tID        Snowflake           Name`)
        log(`\t----------------------------------------`)
        const markedGuilds = await Database.Client.guild.findMany({ where: { deleted_at: { not: null }}})
        for(const guild of markedGuilds)
            log(`\t${guild.guild_id.toString().padEnd(9)} ${guild.snowflake.toString().padEnd(19)} ${guild.name}`)
        if(0 === markedGuilds.length)
            log(`\t(none)`)

        log()
        info('Registering commands...')
        for(const guild of await Database.Client.guild.findMany({ where: { deleted_at: null }})){
            log(`\tRegistering commands on: ${guild.name}`)
            await registerCommands({
                token: DISCORD_TOKEN,
                clientId: OAUTH_CLIENT_ID,
                guildId: guild.snowflake
            })
        }

        client.user.setActivity(`/glenna help`)
        info('Startup complete!')
    }
})
