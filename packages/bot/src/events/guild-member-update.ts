import { listener } from '../EventListener.js'
import { Database, getRedisClient, Guilds } from '@glenna/common'
import type { HistoryEvent, Prisma } from '@glenna/prisma'

export default listener('guildMemberUpdate', {
    async execute(oldMember, newMember){
        const guild = newMember.guild
        if(newMember.user.id === newMember.client.user?.id){
            console.log({ type: 'guildMemberUpdate', note: 'Skipping update to ScholarGlenna.' })
            return
        }

        const redis = await getRedisClient()
        const [ moderatorKey, managerKey, teamsKey ] = Guilds.getKeys(guild)
        const [ moderatorRole, managerRole ] = await Promise.all([
            redis.get(moderatorKey),
            redis.get(managerKey)
        ])

        const memberDelta = {} as Prisma.GuildMemberUpdateInput
        if(oldMember.avatar !== newMember.avatar){
            // guild avatar only; user avatar changes trigger user-update instead.
            memberDelta.avatar = memberDelta.avatar
        }
        if(oldMember.nickname !== newMember.nickname){
            memberDelta.nickname = newMember.nickname
        }
        if(guild.ownerId === newMember.user.id)
            null; // guild owner is managed elsewhere, don't update role
        else if(moderatorRole && newMember.roles.cache.has(moderatorRole))
            memberDelta.role = 'Moderator'
        else if(managerRole && newMember.roles.cache.has(managerRole))
            memberDelta.role = 'Manager'
        else if((moderatorRole && oldMember.roles.cache.has(moderatorRole)) || (managerRole && oldMember.roles.cache.has(managerRole)))
            memberDelta.role = null
        const memberChanged = Object.entries(memberDelta).length > 0

        const removedFromTeams = new Set<bigint>()
        const addedToTeams = new Set<bigint>()
        if(oldMember.roles.cache.size > newMember.roles.cache.size){
            // removed from role
            const roles = oldMember.roles.cache.filter((_, role) => !newMember.roles.cache.has(role))
            /*
            // TODO: search audit logs to associate updates with acting user
            const log = await guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberRoleUpdate
            }).then(logs => logs.entries.filter(log => log.target?.id === newMember.id).first())
            console.log({ log })
            */
            for(const [ id ] of roles.entries()){
                // if role is deleted, let that be handled by role-delete
                console.log({ removedFrom: id })
                if(null !== await guild.roles.fetch(id) && await redis.sIsMember(teamsKey, id))
                    removedFromTeams.add(BigInt(id))
            }
        } else if(oldMember.roles.cache.size < newMember.roles.cache.size){
            // added to role
            const roles = newMember.roles.cache.filter((_, role) => !oldMember.roles.cache.has(role))
            for(const [ id ] of roles.entries()){
                console.log({ addedTo: id })
                if(await redis.sIsMember(teamsKey, id))
                    addedToTeams.add(BigInt(id))
            }
        }
        console.log({ removedFromTeams, addedToTeams, memberDelta })

        if(removedFromTeams.size > 0 || addedToTeams.size > 0 || memberChanged){
            const guildSnowflake = BigInt(guild.id)
            const correlationId = await Database.Instance.newSnowflake()
            await Database.Client.$transaction(async client => {
                const guild = await client.guild.findUnique({ where: { snowflake: guildSnowflake }, select: { guild_id: true, name: true, snowflake: true }})
                if(!guild)
                    throw `Couldn't find guild ${guildSnowflake}!`
                const member = await Database.GuildMembers.fetch(newMember, guild, { client, update: memberDelta, correlationId: correlationId })
                if(removedFromTeams.size > 0){
                    const teams = await client.team.findMany({ where: { role: { in: [...removedFromTeams] }}, select: { team_id: true, name: true }})
                    await client.teamMember.deleteMany({
                        where: {
                            guild_member_id: member.guild_member_id,
                            team_id: { in: teams.map(team => team.team_id) }
                        }
                    })
                    await client.history.createMany({
                        data: teams.map(team => ({
                            correlation_id: correlationId,
                            event_type: 'TeamMemberRemove' as HistoryEvent,
                            actor_name: 'ScholarGlenna',
                            user_snowflake: member.user.snowflake,
                            user_name: member.vmember.display_name,
                            guild_snowflake: guild.snowflake,
                            guild_name: guild.name,
                            team_id: team.team_id,
                            team_name: team.name
                        }))
                    })
                    await Database.GuildMembers.prune({ client, correlationId })
                }
                if(addedToTeams.size > 0){
                    const teams = await client.team.findMany({
                        where: {
                            role: { in: [...addedToTeams] },
                            members: { none: { guild_member_id: member.guild_member_id }}
                        },
                        select: { team_id: true, name: true }
                    })
                    await client.teamMember.createMany({
                        data: teams.map(team => ({
                            guild_member_id: member.guild_member_id,
                            team_id: team.team_id
                        }))
                    })
                    await client.history.createMany({
                        data: teams.map(team => ({
                            correlation_id: correlationId,
                            event_type: 'TeamMemberAdd' as HistoryEvent,
                            actor_name: 'ScholarGlenna',
                            user_snowflake: member.user.snowflake,
                            user_name: member.vmember.display_name,
                            guild_snowflake: guild.snowflake,
                            guild_name: guild.name,
                            team_id: team.team_id,
                            team_name: team.name
                        }))
                    })
                }
            })
        }
    }
})
