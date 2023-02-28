import { listener } from '../EventListener.js'
import { database } from '../util/database.js'

export const channelDeleteListener = listener('channelDelete', {
    async execute(channel){
        await database.team.updateMany({
            where: { channel: BigInt(channel.id) },
            data: { channel: null }
        })
    }
})
