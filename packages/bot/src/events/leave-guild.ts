import { Database, getRedisClient, Guilds } from '@glenna/common'
import { listener } from '../EventListener.js'
export default listener('guildDelete', {
    async execute(guild){
        console.log(`Leaving guild: ${guild.name}`)
        const snowflake = BigInt(guild.id)
        const redis = await getRedisClient()
        await Database.Client.guild.update({ where: { snowflake }, data: { deleted_at: new Date() }})
        await redis.del(Guilds.getKeys(guild))
    }
})
