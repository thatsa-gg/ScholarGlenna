import type { Prisma } from '@glenna/prisma'
import { listener } from '../EventListener.js'
import { database } from '../util/database.js'
import { info } from '../util/logging.js'

export const roleUpdateListener = listener('roleUpdate', {
    async execute(oldRole, newRole){
        const data: Prisma.TeamUpdateInput = {}
        if(oldRole.icon !== newRole.icon)
            data.icon = newRole.icon
        if(Object.keys(data).length > 0){
            info(`Role changed: ${JSON.stringify(data)}`)
            await database.team.updateMany({ where: { role: BigInt(newRole.id) }, data })
        }
    }
})
