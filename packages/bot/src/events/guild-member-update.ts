import { listener } from '../EventListener.js'
import { getRedisClient, Guilds } from '@glenna/common'
import { AuditLogEvent } from 'discord.js'

export default listener('guildMemberUpdate', {
    async execute(oldMember, newMember){
        const guild = newMember.guild
        console.log({
            type: 'guildMemberUpdate',
            oldMember, newMember
        })

        const redis = await getRedisClient()
        const [ moderatorKey, managerKey, teamsKey ] = Guilds.getKeys(guild)
        const [ moderatorRole, managerRole ] = await Promise.all([
            redis.get(moderatorKey),
            redis.get(managerKey)
        ])

        if(oldMember.avatar !== newMember.avatar){
            // TODO: avatar changed
        }
        if(oldMember.nickname !== newMember.nickname){
            // TODO: nickname changed
        }
        if(oldMember.roles.cache.size > newMember.roles.cache.size){
            // removed from role
            const roles = oldMember.roles.cache.filter((_, role) => !newMember.roles.cache.has(role))
            const log = await guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberRoleUpdate
            }).then(logs => logs.entries.filter(log => log.target?.id === newMember.id).first())
            for(const [ id, role ] of roles.entries()){
                // if role is deleted, let that be handled by role-delete
                if(null === await guild.roles.fetch(id))
                    continue;

                if(id === moderatorRole) null; // TODO: no longer moderator (may still be manager!)
                if(id === managerRole) null; // TODO: no longer manager (moderator takes priority)
                if(await redis.sIsMember(teamsKey, id)) null; // TODO: removed from team
            }
        }
        if(oldMember.roles.cache.size < newMember.roles.cache.size){
            // added to role
            const roles = newMember.roles.cache.filter((_, role) => !oldMember.roles.cache.has(role))
            for(const [ id, role ] of roles.entries()){
                if(id === moderatorRole) null; // TODO: new moderator
                if(id === managerRole) null; // TODO: new manager
                if(await redis.sIsMember(teamsKey, id)) null; // TODO: new team member
            }
            // TODO: added to role
        }
        // TODO: update guild member info
    }
})
