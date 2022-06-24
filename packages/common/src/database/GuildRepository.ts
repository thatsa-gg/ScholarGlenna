import type { Sql, TransactionSql, Helper } from 'postgres'
import type { DataSource } from './index.js'
import { Guild } from '../models/Guild.js'
import {
    Guild as DiscordGuild,
    GuildMember as DiscordGuildMember,
    Snowflake
} from 'discord.js'

export interface GuildInfo {
    guild_id: number
    snowflake: string
    name: string
    icon: string | null
    description: string | null
    preferred_locale: string
    owner_id: number
    manager_id: number
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
    'name',
    'icon',
    'description',
    'preferred_locale',
    'owner_id',
    'manager_id',
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

    async create(source: DiscordGuild, options?: { transaction?: TransactionSql<{}> }): Promise<Guild.Guild> {
        const sql = options?.transaction ?? this.#sql
        const owner = await this.#dataSource.Users.findOrCreate((await source.fetchOwner()).user, { transaction: options?.transaction })
        const [ guild ] = await sql<[ GuildInfo ]>`
            insert into Guilds ${sql({
                snowflake: source.id,
                name: source.name,
                icon: source.icon || null,
                description: source.description || null,
                preferred_locale: source.preferredLocale,
                owner_id: owner.id,
            })} returning ${sql(GuildColumns)}
        `
        if(!guild)
            throw new Error(`Fatal database error ocurred while trying to register new guild.`)
        return new Guild.Guild(guild)
    }

    async get(id: number, options?: { transaction?: TransactionSql<{}> }): Promise<Guild.Guild | null> {
        const sql = options?.transaction ?? this.#sql
        const [ guild ] = await sql<GuildInfo[]>`
            select ${sql(GuildColumns)} from Guilds where guild_id = ${id}
        `
        if(!guild)
            return null
        return new Guild.Guild(guild)
    }

    async getBySnowflake(snowflake: string, options?: { transaction?: TransactionSql<{}> }): Promise<Guild.Guild | null> {
        const sql = options?.transaction ?? this.#sql
        const [ guild ] = await sql<GuildInfo[]>`
            select ${sql(GuildColumns)} from Guilds where snowflake = ${snowflake}
        `
        if(!guild)
            return null
        return new Guild.Guild(guild)
    }

    async findOrCreate(source: DiscordGuild, options?: { transaction?: TransactionSql<{}> }): Promise<Guild.Guild> {
        const guild = await this.getBySnowflake(source.id, { transaction: options?.transaction })
        if(!guild)
            return await this.create(source, { transaction: options?.transaction })
        if(guild.deletedAt)
            return await this.update(source, guild, { restore: true, transaction: options?.transaction })
        return guild
    }

    async update(source: DiscordGuild, target: UpdateGuildInfo | Guild.Guild, options?: { restore?: boolean, transaction?: TransactionSql<{}> }): Promise<Guild.Guild> {
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
        } else {
            if(target.deleted_at && options?.restore)
                properties.deleted_at = null
            if(target.preferred_locale !== source.preferredLocale)
                properties.preferred_locale = source.preferredLocale
        }
        // TODO: owner_id
        // TOOD: manager_id
        // TODO: moderator_role
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

    delete(target: Guild.Guild, options?: { transaction?: TransactionSql<{}> }): Promise<DeletionSummary[]>
    delete(source: DiscordGuild, options?: { transaction?: TransactionSql<{}> }): Promise<DeletionSummary[]>
    delete(target: { except: Snowflake | Snowflake[] }, options?: { transaction?: TransactionSql<{}> }): Promise<DeletionSummary[]>
    async delete(target: Guild.Guild | DiscordGuild | { except: Snowflake | Snowflake[]}, options?: { transaction?: TransactionSql<{}> }): Promise<DeletionSummary[]> {
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

    async import(source: DiscordGuild): Promise<Guild.Guild> {
        return await this.#sql.begin(async sql => {
            const [ guildExists ] = await sql<UpdateGuildInfo[]>`
                select
                    guild_id,
                    name,
                    icon,
                    description,
                    preferred_locale,
                    owner_id,
                    manager_id,
                    moderator_role,
                    deleted_at
                from Guilds where snowflake = ${source.id}`
            const guild = guildExists
                ? await this.update(source, guildExists, { restore: true, transaction: sql })
                : await this.create(source, { transaction: sql })
            const members = await source.members.fetch()
            await this.bulkImportMembers(guild, members.values(), sql)
            // TODO: validate teams, roles, manager, owner
            return guild
        })
    }

    async bulkImportMembers(guild: Guild.Guild, members: IterableIterator<DiscordGuildMember>, transaction: TransactionSql<{}>){
        // TODO: more efficient
        const sql = transaction
        await sql`
            create temporary table KeepMembers (
                member_id integer primary key
            )
        `
        for(const member of members){
            const user = await this.#dataSource.Users.findOrCreate(member.user, { transaction })
            const entity = await this.#dataSource.GuildMembers.findOrCreate(user, guild, member, { transaction })
            await sql`insert into KeepMembers ${sql({
                member_id: entity.id
            })}`
        }
        const removedMemberUsers = await sql<{ user_id: number }[]>`
            update GuildMembers set deleted_at = now() where
                guild_id = ${guild.id} and
                member_id not in (select member_id from KeepMembers)
            returning user_id
        `
        await sql`drop table KeepMembers`
        if(removedMemberUsers.length > 0){
            await sql`
                create temporary table CheckUsers (
                    user_id integer primary key
                )
            `
            await sql`insert into CheckUsers ${sql(removedMemberUsers)}`
            await sql`
                update Users set deleted_at = now() where
                    user_id in (select user_id from CheckUsers
                        where user_id not in (select user_id from Profiles))
            `
            await sql`drop table CheckUsers`
        }
    }
}
