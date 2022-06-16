import { log, info, error } from 'console'
import { DISCORD_TOKEN, VERSION } from './config'

import { Client, Intents } from 'discord.js'
import { load } from '@glenna/util'
import type { EventListener } from './EventListener'

export const Glenna: Client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
})

log('Registering events...')
for(const { name, once, execute } of await load<EventListener | EventListener[]>(import.meta, './events').then(a => a.flat())){
    log(`\tRegistering handler for event "${name}"${!once?'':' (once)'}`)
    if(once)
        Glenna.once(name, execute)
    else
        Glenna.on(name, execute)
}

export async function login(): Promise<void> {
    try {
        info("Logging in.")
        const reason = await Glenna.login(DISCORD_TOKEN)
        log(reason)
        info("Login successful.")
        info(`GlennaBot v.${VERSION} running.`)
    } catch(err){
        error(err)
        return
    }
}
