import { log, info, error } from 'console'
import { VERSION } from './config.js'
import type { EventListener } from './EventListener'

import { Discord } from '@glenna/common'
import './commands.js'

export const Glenna = Discord.createClient()
import joinGuild from './events/join-guild.js'
import leaveGuild from './events/leave-guild.js'
import onCommand from './events/on-command.js'
import ready from './events/ready.js'

log('Registering events...')
for(const { name, once, execute } of [
    joinGuild,
    leaveGuild,
    onCommand,
    ready
] as EventListener[]){
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
