import { Database } from '@glenna/common'
import { listener } from '../EventListener.js'

export default listener('channelDelete', {
    async execute(channel){
        await Database.Teams.removeTeamChannel(BigInt(channel.id))
    }
})
