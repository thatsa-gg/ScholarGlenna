import { database } from '../util/database.js'
import { debug } from '../util/logging.js'
import { listener } from '../EventListener.js'
import type { Prisma } from '@glenna/prisma'

export const guildMemberUpdateListener = listener('guildMemberUpdate', {
    async execute(oldMember, newMember){
        if(newMember.user.id === newMember.client.user?.id){
            debug(`Skipping user update for ScholarGlenna bot.`)
            return
        }

        const currentUser = await database.user.findUnique({
            where: { snowflake: BigInt(newMember.user.id) },
            select: {
                guildMemberships: {
                    where: { guild: { snowflake: BigInt(newMember.guild.id) }},
                    select: {
                        id: true,
                        name: true,
                        icon: true
                    }
                }
            }
        })
        if(!currentUser){
            debug(`Skipping update for user not in database.`)
            return
        }

        const [ currentMember ] = currentUser.guildMemberships
        if(!currentMember){
            debug(`Skipping update for member not in database.`)
            return
        }

        const removedRoles = oldMember.roles.cache.filter((_, role) => !newMember.roles.cache.has(role))
        const addedRoles = newMember.roles.cache.filter((_, role) => !oldMember.roles.cache.has(role))
        const teamRoles = new Map(await database.team.findMany({
            where: {
                role: {
                    in: Array.from(new Set([ ...removedRoles.keys(), ...addedRoles.keys() ]), a => BigInt(a))
                }
            },
            select: {
                id: true,
                role: true
            }
        }).then(results => results.map(({ id, role }) => [ role!.toString(), id! ])))

        const data: Prisma.GuildMemberUpdateInput = {}
        if(currentMember.name !== newMember.nickname)
            data.name = newMember.nickname
        if(currentMember.icon !== newMember.avatar)
            data.icon = newMember.avatar
        if(currentMember.lostRemoteReferenceAt !== null)
            data.lostRemoteReferenceAt = null

        const removedTeams: number[] = Array.from(removedRoles.filter((_, k) => teamRoles.has(k)).map((_, k) => teamRoles.get(k)!))
        if(removedTeams.length > 0){
            data.teamMemberships ??= {}
            data.teamMemberships.deleteMany = { teamId: { in: removedTeams }}
        }

        const addedTeams: Prisma.TeamMemberCreateManyMemberInput[] = Array.from(
            addedRoles.filter((_, k) => teamRoles.has(k)).map((_, k) => teamRoles.get(k)!),
            teamId => ({ teamId, role: 'Member' }))
        if(addedTeams.length > 0){
            data.teamMemberships ??= {}
            data.teamMemberships.createMany = { data: addedTeams }
        }
        if(Object.keys(data).length > 0){
            debug(`User updated (${newMember.displayName} -- ${newMember.id}): ${JSON.stringify(data)}`)
            await database.guildMember.update({ where: { id: currentMember.id }, data })
        }
    }
})
