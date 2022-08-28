import { listener } from '../EventListener.js'
import { warn } from 'console'

export default listener('guildMemberUpdate', {
    async execute(oldMember, newMember){
        // TODO: update guild member info
    }
})
