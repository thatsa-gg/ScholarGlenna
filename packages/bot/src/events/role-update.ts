import { listener } from '../EventListener.js'
import { warn } from 'console'
import { Database, getRedisClient, Guilds } from '@glenna/common'
import type { FieldHistory } from '@glenna/util'
import type { Prisma } from '@glenna/prisma'

export default listener('roleUpdate', {
    async execute(oldRole, newRole){
        const redis = await getRedisClient()
        const [,, teamsKey] = Guilds.getKeys(newRole.guild)
        if(await redis.sIsMember(teamsKey, newRole.id)){
            const changed: FieldHistory<Prisma.TeamUpdateInput>[] = []
            const data: Prisma.TeamUpdateInput = {}
            if(oldRole.color !== newRole.color){
                changed.push({ field: 'color', old: oldRole.color, new: newRole.color })
                data.color = newRole.color
            }
            if(oldRole.icon !== newRole.icon){
                changed.push({ field: 'icon', old: oldRole.icon, new: newRole.icon })
                data.icon = newRole.icon
            }
            if(changed.length > 0){
                data.updated_at = new Date()
                const role = BigInt(newRole.id)
                await Database.Client.$transaction(async client => {
                    const guild = await client.guild.findUniqueOrThrow({ where: { snowflake: BigInt(newRole.guild.id) }, select: { guild_id: true, snowflake: true, name: true }})
                    const historyData: Prisma.HistoryUncheckedCreateInput[] = []
                    for(const team of await client.team.findMany({ where: { guild_id: guild.guild_id, role }, select: { team_id: true, name: true }})){
                        await client.team.update({
                            where: { team_id: team.team_id },
                            data,
                            select: null
                        })
                        historyData.push({
                            event_type: 'TeamEdit',
                            actor_name: 'ScholarGlenna',
                            guild_name: guild.name,
                            guild_snowflake: guild.snowflake,
                            team_name: team.name,
                            team_id: team.team_id,
                            data: changed
                        })
                    }
                    await client.history.createMany({ data: historyData })
                })
            }
        }
    }
})
