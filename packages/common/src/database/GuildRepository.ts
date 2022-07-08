import type { Sql, Helper } from 'postgres'
import type { DataSource, Transactable } from './index.js'
import { Guild } from '../models/Guild.js'
import type { User } from '../models/User.js'
import {
    Guild as DiscordGuild,
    GuildMember as DiscordGuildMember,
    Role as DiscordRole,
    Snowflake
} from 'discord.js'

export type GuildManagerRole = 'Owner' | 'Manager' | 'Moderator'
export interface GuildInfo {
    guild_id: number
    snowflake: string
    alias: string
    name: string
    icon: string | null
    description: string | null
    preferred_locale: string
    manager_role: string | null
    moderator_role: string | null
    created_at: Date
    updated_at: Date
    deleted_at: Date | null
}
type UpdateGuildInfo = Omit<GuildInfo, 'snowflake' | 'created_at' | 'updated_at'>
type DeletionSummary = { id: number, snowflake: string, name: string }

const GuildColumns: (keyof GuildInfo)[] = [
    'guild_id',
    'snowflake',
    'alias',
    'name',
    'icon',
    'description',
    'preferred_locale',
    'moderator_role',
    'created_at',
    'updated_at',
    'deleted_at'
]

export class GuildRepository {
    #sql: Sql<{}>
    #dataSource: DataSource
    constructor(sql: Sql<{}>, dataSource: DataSource){
        this.#sql = sql
        this.#dataSource = dataSource
    }

    async create(source: DiscordGuild, options?: Transactable): Promise<Guild.Guild> {
        const sql = options?.transaction ?? this.#sql
        const owner = await this.#dataSource.Users.findOrCreate((await source.fetchOwner()).user, { transaction: options?.transaction })
        const [ guild ] = await sql<[ GuildInfo ]>`
            insert into Guilds ${sql({
                snowflake: source.id,
                alias: BigInt(source.id).toString(36),
                name: source.name,
                icon: source.icon || null,
                description: source.description || null,
                preferred_locale: source.preferredLocale,
            })} returning ${sql(GuildColumns)}
        `
        if(!guild)
            throw new Error(`Fatal database error ocurred while trying to register new guild.`)
        const entity = new Guild.Guild(guild)
        if(!await this.setRole(entity, owner, 'Owner', { transaction: sql }))
            throw new Error(`Fatal database error ocurred while trying to set guild owner role for guild ${entity.id} (owner ${owner.id})`)
        return entity
    }

    async get(id: number, options?: Transactable): Promise<Guild.Guild | null> {
        const sql = options?.transaction ?? this.#sql
        const [ guild ] = await sql<GuildInfo[]>`
            select ${sql(GuildColumns)} from Guilds where guild_id = ${id}
        `
        if(!guild)
            return null
        return new Guild.Guild(guild)
    }

    async getBySnowflake(snowflake: string, options?: Transactable): Promise<Guild.Guild | null> {
        const sql = options?.transaction ?? this.#sql
        const [ guild ] = await sql<GuildInfo[]>`
            select ${sql(GuildColumns)} from Guilds where snowflake = ${snowflake}
        `
        if(!guild)
            return null
        return new Guild.Guild(guild)
    }

    async lookup(id: string, options?: Transactable): Promise<Guild.Guild | null> {
        const sql = options?.transaction ?? this.#sql
        const [ guild ] = await sql<GuildInfo[]>`select ${sql(GuildColumns)} from Guilds where deleted_at is null and alias = lower(${id})`
        if(!guild)
            return null
        return new Guild.Guild(guild)
    }

    getForUser(user: User.User, options?: Transactable): Promise<Guild.Guild[]>;
    getForUser(user: number, options?: Transactable): Promise<Guild.Guild[]>;
    async getForUser(user: User.User | number, options?: Transactable): Promise<Guild.Guild[]> {
        const sql = options?.transaction ?? this.#sql
        const userId = typeof user === 'number' ? user : user.id
        const guilds = await sql<GuildInfo[]>`
            select ${sql(GuildColumns)} from UserMemberships inner join Guilds using (guild_id) where UserMemberships.user_id = ${userId}
        `
        return guilds.map(info => new Guild.Guild(info))
    }

    async findOrCreate(source: DiscordGuild, options?: Transactable): Promise<Guild.Guild> {
        const guild = await this.getBySnowflake(source.id, { transaction: options?.transaction })
        if(!guild)
            return await this.create(source, { transaction: options?.transaction })
        if(guild.deletedAt)
            return await this.update(source, guild, { restore: true, transaction: options?.transaction })
        return guild
    }

    async update(source: DiscordGuild, target: UpdateGuildInfo | Guild.Guild, options?: Transactable & { restore?: boolean }): Promise<Guild.Guild> {
        const sql = options?.transaction ?? this.#sql
        const properties = {} as Record<keyof UpdateGuildInfo | 'updated_at', string | number | Helper<any> | null>
        if(target.name !== source.name)
            properties.name = source.name
        if(target.icon !== source.icon)
            properties.icon = source.icon
        if(target.description !== source.description)
            properties.description = source.description
        if(target instanceof Guild.Guild){
            if(target.deletedAt && options?.restore)
                properties.deleted_at = null
            if(target.preferredLocale !== source.preferredLocale)
                properties.preferred_locale = source.preferredLocale
            if(target.managerRole && !await source.roles.fetch(target.managerRole))
                properties.manager_role = null
            if(target.moderatorRole && !await source.roles.fetch(target.moderatorRole))
                properties.moderator_role = null
        } else {
            if(target.deleted_at && options?.restore)
                properties.deleted_at = null
            if(target.preferred_locale !== source.preferredLocale)
                properties.preferred_locale = source.preferredLocale
            if(target.manager_role && !await source.roles.fetch(target.manager_role))
                properties.manager_role = null
            if(target.moderator_role && !await source.roles.fetch(target.moderator_role))
                properties.moderator_role = null
        }
        // TODO: update owner
        const guildId = target instanceof Guild.Guild ? target.id : target.guild_id
        if(Object.keys(properties).length > 0){
            properties.updated_at = sql(`now()`)
            const [ guild ] = await sql<[ GuildInfo ]>`update Guilds set ${sql(properties)} where guild_id = ${guildId} returning ${sql(GuildColumns)}`
            if(!guild)
                throw new Error(`Could not update non-existent guild "${target.name}" (id: ${guildId})`)
            return new Guild.Guild(guild)
        }
        const guild = await this.get(guildId, { transaction: options?.transaction })
        if(!guild)
            throw new Error(`Could not update non-existent guild "${target.name}" (id: ${guildId}) (no changes)`)
        return guild
    }

    delete(target: Guild.Guild, options?: Transactable): Promise<DeletionSummary[]>
    delete(source: DiscordGuild, options?: Transactable): Promise<DeletionSummary[]>
    delete(target: { except: Snowflake | Snowflake[] }, options?: Transactable): Promise<DeletionSummary[]>
    async delete(target: Guild.Guild | DiscordGuild | { except: Snowflake | Snowflake[]}, options?: Transactable): Promise<DeletionSummary[]> {
        const sql = options?.transaction ?? this.#sql
        return await sql.begin(async sql => {
            if(target instanceof Guild.Guild)
                return await sql<DeletionSummary[]>`update Guilds set deleted_at = now() where guild_id = ${target.id} returning guild_id as id, snowflake, name`
            if(target instanceof DiscordGuild)
                return await sql<DeletionSummary[]>`update Guilds set deleted_at = now() where snowflake = ${target.id} returning guild_id as id, snowflake, name`
            await sql`
                create temporary table KeepGuilds (
                    snowflake snowflake primary key
                )
            `
            const except = Array.isArray(target.except) ? target.except : [ target.except ]
            if(except.length > 0)
                await sql`insert into KeepGuilds ${sql(except.map(snowflake => ({ snowflake })))}`
            const summary = await sql<DeletionSummary[]>`update Guilds set deleted_at = now() where snowflake not in (select snowflake from KeepGuilds) returning guild_id as id, snowflake, name`
            await sql`drop table KeepGuilds`
            return summary
        })
        // TODO: update this to a stored procedure and cascade across the guildmember/team/user tree when there are no profiles attached
        // alternatively, include orphaned user cleanup, add on delete cascades for cleanup to take care of teams automatically
        // need to consider what happens w/ leagues when a guild is deleted. Does the team get removed? Marked as expiring?
    }

    async setRole(guild: Guild.Guild, user: User.User, role: GuildManagerRole, options?: Transactable): Promise<boolean> {
        const sql = options?.transaction ?? this.#sql
        const result = await sql`
            insert into GuildManagers ${sql({
                guild_id: guild.id,
                user_id: user.id,
                role
            })} on conflict on constraint manager_unique_per_guild do update set role = ${role}
        `
        return result.count > 0
    }

    async clearRole(guild: Guild.Guild, user: User.User, options?: Transactable): Promise<boolean> {
        const sql = options?.transaction ?? this.#sql
        const result = await sql`
            delete from GuildManagers where guild_id = ${guild.id} and user_id = ${user.id}
        `
        return result.count > 0
    }

    async getRole(guild: Guild.Guild, user: User.User, options?: Transactable): Promise<GuildManagerRole | false> {
        const sql = options?.transaction ?? this.#sql
        const [ result ] = await sql<[{ role: GuildManagerRole }]>`select role from GuildManagers where guild_id = ${guild.id} and user_id = ${user.id}`
        if(!result)
            return false
        return result.role
    }

    async import(source: DiscordGuild): Promise<Guild.Guild> {
        return await this.#sql.begin(async sql => {
            const [ guildExists ] = await sql<UpdateGuildInfo[]>`
                select
                    guild_id,
                    name,
                    icon,
                    description,
                    preferred_locale,
                    manager_role,
                    moderator_role,
                    deleted_at
                from Guilds where snowflake = ${source.id}
            `
            if(guildExists){
                // TODO: clean up old owner
                if(!guildExists.manager_role){
                    const users = await sql<{ user_id: number }[]>`
                        delete from
                            GuildManagers
                        where
                            guild_id = ${guildExists.guild_id}
                            and role = 'Manager' returning user_id
                    `
                    // TODO: delete old user entries if they're not used anywhere else
                } else {
                    // TODO: clean up old managers
                }
                if(!guildExists.moderator_role){
                    const users = await sql<{ user_id: number }[]>`
                        delete from
                            GuildManagers
                        where
                            guild_id = ${guildExists.guild_id}
                            and role = 'Moderator' returning user_id
                    `
                    // TODO: delete old user entries if they're not used anywhere else
                } else {
                    // TODO: clean up old moderators
                }
                // at this point, all old data should be purged.
            }

            // these will also create the owner user entity if it doesn't exist
            const guild = guildExists
                ? await this.update(source, guildExists, { restore: true, transaction: sql })
                : await this.create(source, { transaction: sql })

            if(guild.managerRole){
                const role = await source.roles.fetch(guild.managerRole)
                if(role){
                    for(const member of role.members.values()){
                        const user = await this.#dataSource.Users.findOrCreate(member.user, { transaction: sql })
                        if(!await this.setRole(guild, user, 'Manager', { transaction: sql }))
                            throw new Error(`Fatal database error ocurred while trying to set Manager role for guild ${guild.id} on user ${user.id}.`)
                    }
                }
            }
            if(guild.moderatorRole){
                const role = await source.roles.fetch(guild.moderatorRole)
                if(role){
                    for(const member of role.members.values()){
                        const user = await this.#dataSource.Users.findOrCreate(member.user, { transaction: sql })
                        if(!await this.setRole(guild, user, 'Moderator', { transaction: sql }))
                            throw new Error(`Fatal database error ocurred while trying to set Moderator role for guild ${guild.id} on user ${user.id}.`)
                    }
                }
            }
            // TODO: validate teams
            return guild
        })
    }
}
