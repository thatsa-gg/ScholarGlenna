import { listener } from '../EventListener.js'

export default listener('guildMemberRemove', {
    async execute(member){
        console.log({
            type: 'guildMemberRemove',
            member
        })
        // TODO: remove from teams, if removed from any notify
        // TODO: remove from guild
        // TODO: prune
    }
})
