import { listener } from '../EventListener.js'
import { warn } from 'console'

export default listener('guildMemberRemove', {
    async execute(member){
        console.log({
            type: 'guildMemberRemove',
            member
        })
        // TODO
    }
})
