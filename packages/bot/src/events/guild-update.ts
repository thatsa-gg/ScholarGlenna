import type { Prisma } from '@glenna/prisma'
import { listener } from '../EventListener.js'
import { database } from '../util/database.js'

export const guildUpdateListener = listener('guildUpdate', {
    async execute(oldGuild, newGuild){
        const data: Prisma.GuildUpdateInput = {}
        if(oldGuild.name !== newGuild.name)
            data.name = newGuild.name
        if(Object.keys(data).length > 0)
            await database.guild.update({ where: { snowflake: BigInt(newGuild.id) }, data })
    }
})
