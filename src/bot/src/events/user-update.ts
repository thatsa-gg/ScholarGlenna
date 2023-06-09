import type { Prisma } from '@glenna/prisma'
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
        const realUserName = newUser.discriminator === "0" ? newUser.username : `${newUser.username}#${newUser.discriminator}`
        if(realUserName !== currentUser.name)
            data.name = realUserName
        if(Object.keys(data).length > 0)
            await database.user.update({ where: { id: currentUser.id }, data })
    }
})
