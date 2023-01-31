import { info, debug, error } from './util/logging.js'
import { VERSION } from './config.js'
import { Discord } from '@glenna/common'

// import events
import { channelDeleteListener } from './events/channel-delete.js'
import { guildMemberUpdateListener } from './events/guild-member-update.js'
import { guildMemberRemoveListener } from './events/guild-member-remove.js'
import { guildUpdateListener } from './events/guild-update.js'
import { joinGuildListener } from './events/join-guild.js'
import { leaveGuildListener } from './events/leave-guild.js'
import { readyListener } from './events/ready.js'
import { roleUpdateListener } from './events/role-update.js'
import { userUpdateListener } from './events/user-update.js'
import { onCommandListener } from './events/on-command.js'

export const Glenna = Discord.createClient()
debug("Registering events...")
channelDeleteListener.register(Glenna)
guildMemberUpdateListener.register(Glenna)
guildMemberRemoveListener.register(Glenna)
guildUpdateListener.register(Glenna)
joinGuildListener.register(Glenna)
leaveGuildListener.register(Glenna)
onCommandListener.register(Glenna)
readyListener.register(Glenna)
roleUpdateListener.register(Glenna)
userUpdateListener.register(Glenna)

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
