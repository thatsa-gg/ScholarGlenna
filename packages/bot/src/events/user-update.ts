import { Database } from '@glenna/common'
import type { Prisma } from '@glenna/prisma'
import { listener } from '../EventListener.js'

export default listener('userUpdate', {
    async execute(oldUser, newUser){
        const data = {} as Prisma.UserUpdateInput
        if(oldUser.avatar !== newUser.avatar)
            data.avatar = newUser.avatar
        if(oldUser.username !== newUser.username)
            data.username = newUser.username
        if(oldUser.discriminator !== newUser.discriminator)
            data.discriminator = Number.parseInt(newUser.discriminator)
        if(Object.entries(data).length > 0){
            const users = await Database.Client.user.updateMany({ where: { snowflake: BigInt(newUser.id) }, data })
            if(users.count > 0 && ('username' in data || 'discriminator' in data)){
                await Database.Client.history.create({
                    data: {
                        event_type: 'UserNameChange',
                        actor_name: `${oldUser.username}#${oldUser.discriminator}`,
                        actor_snowflake: BigInt(oldUser.id),
                        user_name: `${newUser.username}#${newUser.discriminator}`,
                        user_snowflake: BigInt(newUser.id),
                    }
                })
            }
        }
    }
})
