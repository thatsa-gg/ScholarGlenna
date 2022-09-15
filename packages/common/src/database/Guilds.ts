import type { Guild as DiscordGuild } from 'discord.js'
import type { Prisma, Guild } from '../../generated/client'
import type { Database } from '.'
import { getRedisClient } from '../redis/index.js'

export type GuildDeletionSummary = { id: number, snowflake: bigint, name: string }
export class Guilds {
    #database: Database
    constructor(database: Database){ this.#database = database }

    static getKeys(source: { id: string }): [ moderatorKey: string, managerKey: string, teamsKey: string ] {
        return [
            `role_${source.id}_moderator`,
            `role_${source.id}_manager`,
            `role_${source.id}_teams`
        ]
    }

    async import(sources: DiscordGuild[], options?: { replace: true }): Promise<Guild[]> {
        const {
            replace = false
        } = options ?? {}
        const redis = await getRedisClient()
        const guilds = await this.#database.Client.$transaction<Guild[]>(async client => {
            const Import = this.#database.Import
            await client.importGuilds.createMany({
                data: sources.map(guild => {
                    const guild_snowflake = BigInt(guild.id)
                    return {
                        guild_snowflake,
                        name: guild.name,
                        vanity: guild.vanityURLCode,
                        alias: guild_snowflake.toString(36),
                        icon: guild.icon,
                        description: guild.description,
                        preferred_locale: guild.preferredLocale
                    }
                })
            })
            const sourceMap = new Map(sources.map(source => [source.id, source]))
            const requestId = await this.#database.newSnowflake()
            const guilds = await Import.importGuilds(client, requestId, { replace })

            for(const [id, guild] of guilds){
                const source = sourceMap.get(id)
                if(!source)
                    throw new Error("Could not find matching guild source.")

                // populate caches
                await source.members.fetch()

                // check that manager/moderator roles still exist.
                if(null !== guild.moderator_role || null !== guild.manager_role){
                    const data: Prisma.GuildUpdateInput = {}
                    if(null !== guild.moderator_role){
                        const role = await source.roles.fetch(guild.moderator_role.toString())
                        if(null === role)
                            data.moderator_role = null
                    }
                    if(null !== guild.manager_role){
                        const role = await source.roles.fetch(guild.manager_role.toString())
                        if(null === role)
                            data.manager_role = null
                    }
                    if(Object.keys(data).length > 0){
                        data.updated_at = new Date()
                        await client.guild.update({ where: { guild_id: guild.guild_id }, data })
                    }
                }

                // update team data for relevant teams
                const teams = await client.team.findMany({
                    where: {
                        guild_id: guild.guild_id
                    },
                    include: {
                        guild: {
                            select: {
                                snowflake: true,
                                name: true
                            }
                        },
                        members: {
                            select: {
                                guild_member: {
                                    select: {
                                        user: {
                                            select: {
                                                snowflake: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })

                const managerRole = null === guild.manager_role ? null : await source.roles.fetch(guild.manager_role.toString())
                const moderatorRole = null === guild.moderator_role ? null : await source.roles.fetch(guild.moderator_role.toString())
                const owner = await source.fetchOwner()
                const teamMembers = [] as Prisma.ImportTeamMembersCreateInput[]
                const guildMembers = new Map<string, Prisma.ImportGuildMembersCreateInput>()
                guildMembers.set(owner.id, {
                    user_snowflake: BigInt(owner.id),
                    guild_id: guild.guild_id,
                    username: owner.user.username,
                    discriminator: Number.parseInt(owner.user.discriminator),
                    nickname: owner.nickname,
                    user_avatar: owner.user.avatar,
                    guild_avatar: owner.avatar,
                    role: 'Owner'
                })

                const [ moderatorKey, managerKey, teamsKey ] = Guilds.getKeys(source)
                await redis.del([
                    moderatorKey,
                    managerKey,
                    teamsKey
                ])
                if(moderatorRole){
                    await redis.set(moderatorKey, moderatorRole.id)
                    for(const member of moderatorRole.members.values()){
                        if(!guildMembers.has(member.id)){
                            guildMembers.set(member.id, {
                                user_snowflake: BigInt(member.id),
                                guild_id: guild.guild_id,
                                username: member.user.username,
                                discriminator: Number.parseInt(member.user.discriminator),
                                nickname: member.nickname,
                                user_avatar: member.user.avatar,
                                guild_avatar: member.avatar,
                                role: 'Manager'
                            })
                        }
                    }
                }

                if(managerRole){
                    await redis.set(managerKey, managerRole.id)
                    for(const member of managerRole.members.values()){
                        if(!guildMembers.has(member.id)){
                            guildMembers.set(member.id, {
                                user_snowflake: BigInt(member.id),
                                guild_id: guild.guild_id,
                                username: member.user.username,
                                discriminator: Number.parseInt(member.user.discriminator),
                                nickname: member.nickname,
                                user_avatar: member.user.avatar,
                                guild_avatar: member.avatar,
                                role: 'Manager'
                            })
                        }
                    }
                }

                const teamRoles = teams
                    .filter(team => null !== team.role)
                    .map(team => team.role!.toString())
                if(teamRoles.length > 0)
                    await redis.sAdd(teamsKey, teamRoles)
                for(const team of teams){
                    for(const snowflake of team.members.map(member => member.guild_member.user.snowflake.toString())){
                        const member = source.members.cache.get(snowflake)
                        if(!member)
                            continue
                        const user_snowflake = BigInt(member.id)
                        if(!guildMembers.has(snowflake)){
                            guildMembers.set(snowflake, {
                                user_snowflake,
                                guild_id: guild.guild_id,
                                username: member.user.username,
                                discriminator: Number.parseInt(member.user.discriminator),
                                nickname: member.nickname,
                                user_avatar: member.user.avatar,
                                guild_avatar: member.avatar
                            })
                        }
                        if(null === team.role)
                            teamMembers.push({ user_snowflake, team_id: team.team_id })
                    }
                    const data: Prisma.TeamUpdateInput = {}
                    if(null !== team.channel && null === await source.channels.fetch(team.channel.toString()))
                        data.channel = null
                    if(null !== team.role){
                        const role = await source.roles.fetch(team.role.toString())
                        if(null === role)
                            data.role = null
                        else {
                            if(role.icon !== team.icon)
                                data.icon = role.icon
                            if(role.color !== team.color)
                                data.color = role.color
                            for(const member of role.members.values()){
                                const user_snowflake = BigInt(member.id)
                                if(!guildMembers.has(member.id)){
                                    guildMembers.set(member.id, {
                                        user_snowflake,
                                        guild_id: guild.guild_id,
                                        username: member.user.username,
                                        discriminator: Number.parseInt(member.user.discriminator),
                                        nickname: member.nickname,
                                        user_avatar: member.user.avatar,
                                        guild_avatar: member.avatar
                                    })
                                }
                                teamMembers.push({ user_snowflake, team_id: team.team_id })
                            }
                        }
                    }
                    if(Object.keys(data).length > 0){
                        data.updated_at = new Date()
                        await client.team.update({ where: { team_id: team.team_id }, data })
                        await client.history.create({ data: {
                            correlation_id: requestId,
                            event_type: 'TeamEdit',
                            actor_name: 'ScholarGlenna',
                            guild_snowflake: team.guild.snowflake,
                            guild_name: team.guild.name,
                            team_id: team.team_id,
                            team_name: team.name,
                            data: data as Prisma.JsonObject
                        }})
                    }
                }

                if(guildMembers.size > 0)
                    await client.importGuildMembers.createMany({ data: [... guildMembers.values()] })
                if(teamMembers.length > 0)
                    await client.importTeamMembers.createMany({ data: teamMembers })
            }

            await Import.importMembers(client, requestId)
            await Import.importCleanup(client)
            return sources.map(source => guilds.get(source.id)!)
        })

        // prime redis cache
        for(const guild of guilds){
            const [ moderatorKey, managerKey, teamsKey ] = Guilds.getKeys({ id: guild.snowflake.toString() })
            const teams = await this.#database.Client.team.findMany({
                where: {
                    guild_id: guild.guild_id,
                    role: { not: null }
                },
                select: { role: true }
            })
            const roles = teams.filter(team =>null !== team.role).map(team => team.role!.toString())
            await Promise.all([
                redis.set(moderatorKey, guild.moderator_role?.toString() ?? ''),
                redis.set(managerKey, guild.manager_role?.toString() ?? ''),
                roles.length > 0 ? redis.sAdd(teamsKey, roles) : null
            ])
        }
        return guilds
    }
}
