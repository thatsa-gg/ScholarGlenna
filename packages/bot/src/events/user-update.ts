import type { Prisma } from '@glenna/prisma'
import { listener } from '../EventListener.js'
import { database } from '../util/database.js'

export const userUpdateListener = listener('userUpdate', {
    async execute(oldUser, newUser){
        const data: Prisma.UserUpdateInput = {}
        if(oldUser.avatar !== newUser.avatar)
            data.icon = newUser.avatar
        if(oldUser.username !== newUser.username)
            data.name = newUser.username
        if(oldUser.discriminator !== newUser.discriminator)
            data.discriminator = newUser.discriminator
        if(Object.keys(data).length > 0)
            await database.user.update({ where: { snowflake: BigInt(newUser.id) }, data })
    }
})
