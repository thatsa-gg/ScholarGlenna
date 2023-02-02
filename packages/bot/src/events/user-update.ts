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
        if(currentUser.name !== newUser.username)
            data.name = newUser.username
        if(currentUser.discriminator !== newUser.discriminator)
            data.discriminator = newUser.discriminator
        if(Object.keys(data).length > 0)
            await database.user.update({ where: { id: currentUser.id }, data })
    }
})
