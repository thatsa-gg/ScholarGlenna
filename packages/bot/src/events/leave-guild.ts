import { listener } from '../EventListener.js'
export default listener('guildDelete', {
    async execute(guild){
        console.log(`Leaving guild: ${guild.name}`)
        // TODO: mark database
        // TODO: clean up redis cache
    }
})
