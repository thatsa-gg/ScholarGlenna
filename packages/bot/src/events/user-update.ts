import { listener } from '../EventListener.js'
import { warn } from 'console'

export default listener('userUpdate', {
    async execute(oldUser, newUser){
        // TODO: update user info (when does this fire?)
    }
})
