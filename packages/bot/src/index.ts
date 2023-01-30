import { info, debug, error } from './util/logging.js'
import { VERSION } from './config.js'
import { Discord } from '@glenna/common'

// import events
import { readyListener } from './events/ready.js'

export const Glenna = Discord.createClient()
debug("Registering events...")
for(const { name, once, execute } of [
    readyListener,
]){
    if(once){
        debug(`Registering one-time handler for: ${name}`)
        Glenna.once(name, execute)
    } else {
        debug(`Registering multi-use handler for: ${name}`)
        Glenna.on(name, execute)
    }
}

export async function login(): Promise<void> {
    try {
        debug(`Logging in.`)
        void await Discord.login(Glenna)
        debug(`Login successful.`)
        info(`GlennaBot v${VERSION} logged in.`)
    } catch(err){
        error(err)
        return
    }
}
