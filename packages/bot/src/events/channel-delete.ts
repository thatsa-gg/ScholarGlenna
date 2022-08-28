import { listener } from '../EventListener.js'

export default listener('channelDelete', {
    async execute(channel){
        console.log({
            type: 'channelDelete',
            channel
        })
        // TODO: update teams to remove associated channel
    }
})
