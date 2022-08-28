import { listener } from '../EventListener.js'
import { warn } from 'console'

export default listener('roleDelete', {
    async execute(role){
        console.log({
            type: 'roleDelete',
            role
        })
        // TODO: update team, remove role sync
    }
})
