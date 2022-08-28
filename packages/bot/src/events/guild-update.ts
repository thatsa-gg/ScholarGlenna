import { listener } from '../EventListener.js'

export default listener('guildUpdate', {
    async execute(oldGuild, newGuild){
        console.log({
            type: 'guildUpdate',
            oldGuild, newGuild
        })
        // TODO
    }
})
