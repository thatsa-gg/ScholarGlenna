import { listener } from '../EventListener.js'
import { warn } from 'console'

export default listener('roleUpdate', {
    async execute(oldRole, newRole){
        // TODO: update team
    }
})
