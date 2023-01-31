import { listener } from '../EventListener.js'
import { database } from '../util/database.js'
import { info } from '../util/logging.js'
export const leaveGuildListener = listener('guildDelete', {
    async execute(guild){
        info(`Leaving guild: ${guild.name}`)
        const snowflake = BigInt(guild.id)
        await database.guild.update({
            where: { snowflake },
            data: { lostRemoteReferenceAt: new Date() }
        })
    }
})
