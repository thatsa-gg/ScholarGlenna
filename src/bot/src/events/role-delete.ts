import { listener } from '../EventListener.js'
import { database } from '../util/database.js'

export default listener('roleDelete', {
    async execute(role){
        await database.team.updateMany({
            where: { role: BigInt(role.id) },
            data: { role: null }
        })
    }
})
