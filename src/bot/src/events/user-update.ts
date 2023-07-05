import { safeUsername, safeAlias, type Prisma } from '@glenna/prisma'
import { listener } from '../EventListener.js'
import { database } from '../util/database.js'

export const userUpdateListener = listener('userUpdate', {
    async execute(_, newUser){
        const currentUser = await database.user.findUnique({ where: { snowflake: BigInt(newUser.id) }})
        if(!currentUser)
            return
        const data: Prisma.UserUpdateInput = {}
        if(currentUser.icon !== newUser.avatar)
            data.icon = newUser.avatar
        const realUserName = safeUsername(newUser)
        if(realUserName !== currentUser.name)
            data.name = realUserName
        const realAlias = safeAlias(newUser)
        if(realAlias !== currentUser.alias)
            data.alias = realAlias
        if(Object.keys(data).length > 0)
            await database.user.update({ where: { id: currentUser.id }, data })
    }
})
