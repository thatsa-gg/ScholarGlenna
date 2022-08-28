import { log, info, error } from 'console'
import { VERSION } from './config.js'
import type { EventListener } from './EventListener'

import { load } from '@glenna/util'
import { Discord } from '@glenna/common'
import './commands.js'

export const Glenna = Discord.createClient()
log('Registering events...')
for(const { name, once, execute } of await load<EventListener>(import.meta, 'events')){
    log(`\tRegistering handler for event "${name}"${!once?'':' (once)'}`)
    if(once)
        Glenna.once(name, execute)
    else
        Glenna.on(name, execute)
}

export async function login(): Promise<void> {
    try {
        info("Logging in.")
        void await Discord.login(Glenna)
        info("Login successful.")
        info(`GlennaBot v.${VERSION} running.`)
    } catch(err){
        error(err)
        return
    }
}
