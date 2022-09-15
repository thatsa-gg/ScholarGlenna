import { listener } from '../EventListener.js'
import { Database } from '@glenna/common'

export default listener('roleDelete', {
    async execute(role){
        await Database.Teams.removeTeamRole(BigInt(role.id))
    }
})
