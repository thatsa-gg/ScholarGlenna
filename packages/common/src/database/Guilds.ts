import type { Guild as DiscordGuild, Role as DiscordRole } from 'discord.js'
import type { Prisma, Guild, GuildMember, GuildRole } from '../../generated/client'
import type { Database } from '.'
import type { Transactionable } from './Client.js'
import { GuildMembers } from './GuildMembers.js'
import { select } from '@glenna/util'

type UpdateGuildInfo = null | Pick<Guild, 'guild_id' | 'manager_role' | 'moderator_role' | 'name' | 'icon' | 'description' | 'deleted_at' | 'preferred_locale'>
type UpdateGuildOwnerInfo = null | Pick<GuildMember, 'guild_member_id'>
export type GuildDeletionSummary = { id: number, snowflake: bigint, name: string }
export class Guilds {
    #database: Database
    constructor(database: Database){ this.#database = database }
    async upsert(source: DiscordGuild, target: UpdateGuildInfo, targetOwner: UpdateGuildOwnerInfo, options?: Transactionable & { restore?: boolean }): Promise<Guild> {
        const client = options?.client ?? this.#database.Client
        const data = {} as Prisma.GuildCreateInput & Prisma.GuildUpdateInput
        if(target?.name !== source.name)
            data.name = source.name
        if(target?.icon !== source.icon)
            data.icon = source.icon
        if(target?.description !== source.description)
            data.description = source.description
        if(target?.preferred_locale !== source.preferredLocale)
            data.preferred_locale = source.preferredLocale
        if(target?.deleted_at && options?.restore)
            data.deleted_at = null
        if(target?.manager_role && !await source.roles.fetch(target.manager_role.toString()))
            data.manager_role = null
        if(target?.moderator_role && !await source.roles.fetch(target.moderator_role.toString()))
            data.moderator_role = null
        const update = { ...data }
        if(target && Object.keys(data).length > 0)
            update.updated_at = new Date()
        const snowflake = BigInt(source.id)
        const vanity = source.vanityURLCode
        const alias = vanity && 0 === await client.guild.count({ where: { alias: vanity } }) ? vanity : snowflake.toString(36)
        const guild = await client.guild.upsert({ where: { snowflake }, update, create: {
            snowflake, alias,
            name: source.name,
            icon: source.icon,
            description: source.description,
            preferred_locale: source.preferredLocale,
        }})

        const owner = await source.fetchOwner()
        const targetUser = await client.user.findUnique({ where: { snowflake: BigInt(owner.user.id) }})
        const user = await this.#database.Users.upsert(owner.user, targetUser, options)
        const targetMember = await client.guildMember.findUnique(GuildMembers.whereUserGuild(user, guild))
        const guildMember = await this.#database.GuildMembers.upsert(owner, targetMember, user, guild, { ...options, role: 'Owner' })
        if(targetOwner && targetOwner.guild_member_id !== guildMember.guild_member_id){
            // clean up old user role here
            await client.guildMember.update({ where: select(targetOwner, 'guild_member_id'), data: { role: null, updated_at: new Date() }})
        }
        return guild
    }

    async setRole(guild: Guild, type: Exclude<GuildRole, 'Owner'>, role: DiscordRole | null, options?: Transactionable){
        const client = options?.client ?? this.#database.Client
        const now = new Date()
        const roleId = role ? BigInt(role.id) : null
        const where = select(guild, 'guild_id')
        // TODO: use a temporary table to upsert bulk changes
        switch(type){
            case 'Manager':
                await client.guild.update({ where, data: { updated_at: now, manager_role: roleId }})
                break
            case 'Moderator':
                await client.guild.update({ where, data: { updated_at: now, moderator_role: roleId }})
                break
        }
        await client.guildMember.updateMany({ where: { role: type }, data: { updated_at: now, role: null }})
        for(const [, guildMember ] of role?.members ?? []){
            const snowflake = BigInt(guildMember.user.id)
            const targetUser = await client.user.findUnique({ where: { snowflake }})
            const user = await this.#database.Users.upsert(guildMember.user, targetUser, options)
            const targetMember = await client.guildMember.findUnique(GuildMembers.whereUserGuild(user, guild))
            await this.#database.GuildMembers.upsert(guildMember, targetMember, user, guild, { client, role: type })
        }
    }

    async import(source: DiscordGuild): Promise<Guild> {
        return await this.#database.Client.$transaction<Guild>(async client => {
            const snowflake = BigInt(source.id)
            const target = await client.guild.findUnique({ where: { snowflake }, include: {
                owner: { select: { guild_member_id: true }},
                teams: { select: {
                    team_id: true,
                    name: true,
                    channel: true,
                    role: true,
                    color: true,
                    icon: true,
                    members: { select: { guild_member: { select: { guild_member_id: true, user: { select: { snowflake: true, username: true }}}}}}
                }}
            }})
            const guild = await this.upsert(source, target, target?.owner ?? null, { client, restore: true })
            const managers = new Set(!guild.manager_role ? null : await source.roles.fetch(guild.manager_role.toString())
                .then(role => Array.from(role?.members.values() ?? [], member => member.id)))
            const moderators = new Set(!guild.moderator_role ? null : await source.roles.fetch(guild.moderator_role.toString())
                .then(role => Array.from(role?.members.values() ?? [], member => member.id)))
            for(let frame = await source.members.list({ limit: 100 });
                frame.size > 0;
                frame = await source.members.list({ limit: 100, after: frame.at(-1)?.id }))
                await client.keepGuildMember.createMany({ data: Array.from(frame, ([id, member]) => ({
                    guild_id: guild.guild_id,
                    snowflake: BigInt(id),
                    username: member.user.username,
                    discriminator: Number.parseInt(member.user.discriminator),
                    name: member.nickname,
                    avatar: member.avatar,
                    role: member.id === source.ownerId ? 'Owner'
                        : moderators.has(member.id) ? 'Moderator'
                        : managers.has(member.id) ? 'Manager'
                        : null
                }))})
            if(target && target.teams.length > 0){
                const now = new Date()
                for(const team of target.teams){
                    const where = select(team, 'team_id')
                    if(team.channel && !source.channels.cache.has(team.channel.toString())){
                        await client.team.update({ where, data: { channel: null, updated_at: now }})
                    }
                    if(team.role){
                        const role = await source.roles.fetch(team.role.toString())
                        if(!role){
                            await client.team.update({ where, data: {
                                role: null,
                                color: null,
                                icon: null,
                                updated_at: now
                            }})
                        } else {
                            const data: Prisma.TeamUpdateInput = {}
                            if(role.color !== team.color)
                                data.color = role.color
                            if(role.icon !== team.icon)
                                data.icon = role.icon
                            if(Object.keys(data).length > 0){
                                data.updated_at = now
                                await client.team.update({ where, data })
                            }
                        }
                    }
                    for(const member of team.members){
                        const user = member.guild_member.user
                        if(!source.members.cache.has(user.snowflake.toString())){
                            console.debug({
                                stage: 'guild_import',
                                step: 'team_check',
                                target: [
                                    source.name,
                                    team.name,
                                    member.guild_member.user.username
                                ],
                                action: 'delete'
                            })
                            // TODO: notify of user on a team leaving the discord
                            await client.guildMember.update({ where: select(member.guild_member, 'guild_member_id'), data: { deleted_at: now }})
                        }
                    }
                }
            }
            await this.#database.GuildMembers.prune({ client })
            await this.#database.Users.prune({ client })
            return guild
        })
    }

    async delete(except: bigint[]){
        return await this.#database.Client.$transaction<GuildDeletionSummary[]>(async client => {
            await client.$executeRaw`create temp table KeepGuilds (snowflake snowflake primary key);`
            for(const snowflake of except)
                await client.$executeRaw`insert into KeepGuilds (snowflake) values (${snowflake});`
            const summary = await client.$queryRaw<GuildDeletionSummary[]>`
                update Guilds
                set    deleted_at = now()
                where  not exists (select 1 from KeepGuilds where KeepGuilds.snowflake = Guilds.snowflake)
                returning
                    guild_id as id,
                    snowflake,
                    name;
            `
            await client.$executeRaw`drop table KeepGuilds;`
            return summary
        })
    }
}
