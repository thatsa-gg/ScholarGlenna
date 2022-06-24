import type { Sql, TransactionSql, Helper } from 'postgres'
import type { DataSource } from './index.js'
import type { Guild } from '../models/Guild.js'
import { GuildMember } from '../models/GuildMember.js'
import type { User } from '../models/User.js'
import {
    Guild as DiscordGuild,
    GuildMember as DiscordGuildMember,
    Snowflake
} from 'discord.js'

export interface GuildMemberInfo {
    member_id: number
    user_id: number
    guild_id: number
    nickname: string | null
    avatar: string | null
    created_at: Date
    updated_at: Date
    deleted_at: Date | null
}
type UpdateGuildMemberInfo = Omit<GuildMemberInfo, 'created_at' | 'updated_at'>

const GuildMemberColumns: (keyof GuildMemberInfo)[] = [
    'member_id',
    'user_id',
    'guild_id',
    'nickname',
    'avatar',
    'created_at',
    'updated_at',
    'deleted_at',
]

export class GuildMemberRepository {
    #sql: Sql<{}>
    #dataSource: DataSource
    constructor(sql: Sql<{}>, dataSource: DataSource){
        this.#sql = sql
        this.#dataSource = dataSource
    }

    async create(user: User.User, guild: Guild.Guild, source: Pick<GuildMemberInfo, 'nickname' | 'avatar'>, options?: { transaction?: TransactionSql<{}> }): Promise<GuildMember.GuildMember> {
        const sql = options?.transaction ?? this.#sql
        const [ member ] = await sql<[ GuildMemberInfo ]>`
            insert into GuildMembers ${sql({
                user_id: user.id,
                guild_id: guild.id,
                nickname: source.nickname,
                avatar: source.avatar,
            })} returning ${sql(GuildMemberColumns)}
        `
        if(!member)
            throw new Error(`Fatal database error ocurred while trying to register new guild member.`)
        return new GuildMember.GuildMember(member)
    }

    async get(id: number, options?: { transaction?: TransactionSql<{}> }): Promise<GuildMember.GuildMember | null> {
        const sql = options?.transaction ?? this.#sql
        const [ member ] = await sql<GuildMemberInfo[]>`
            select ${sql(GuildMemberColumns)} from GuildMembers where member_id = ${id}
        `
        if(!member)
            return null
        return new GuildMember.GuildMember(member)
    }

    async getByUserAndGuild(user: User.User, guild: Guild.Guild, options?: { transaction?: TransactionSql<{}> }): Promise<GuildMember.GuildMember | null> {
        const sql = options?.transaction ?? this.#sql
        const [ member ] = await sql<GuildMemberInfo[]>`
            select ${sql(GuildMemberColumns)} from GuildMembers where user_id = ${user.id} and guild_id = ${guild.id}
        `
        if(!member)
            return null
        return new GuildMember.GuildMember(member)
    }

    async findOrCreate(user: User.User, guild: Guild.Guild, source: Pick<GuildMemberInfo, 'nickname' | 'avatar'>, options?: { transaction?: TransactionSql<{}> }): Promise<GuildMember.GuildMember> {
        const member = await this.getByUserAndGuild(user, guild, { transaction: options?.transaction })
        if(!member)
            return await this.create(user, guild, source, { transaction: options?.transaction })
        if(member.deletedAt)
            return await this.update(source, member, { restore: true, transaction: options?.transaction })
        return member
    }

    async update(
        source: Pick<GuildMemberInfo, 'nickname' | 'avatar'>,
        target: UpdateGuildMemberInfo | GuildMember.GuildMember,
        options?: { restore?: boolean, transaction?: TransactionSql<{}> }
    ): Promise<GuildMember.GuildMember> {
        const sql = options?.transaction ?? this.#sql
        const properties = {} as Record<keyof UpdateGuildMemberInfo | 'updated_at', string | number | Helper<any> | null>
        if(target.nickname !== source.nickname)
            properties.nickname = source.nickname
        if(target.avatar !== source.avatar)
            properties.avatar = source.avatar
        if(target instanceof GuildMember.GuildMember){
            if(target.deletedAt && options?.restore)
                properties.deleted_at = null
        } else {
            if(target.deleted_at && options?.restore)
                properties.deleted_at = null
        }
        const memberId = target instanceof GuildMember.GuildMember ? target.id : target.member_id
        if(Object.keys(properties).length > 0){
            properties.updated_at = sql(`now()`)
            const [ member ] = await sql<[ GuildMemberInfo ]>`update GuildMembers set ${sql(properties)} where member_id = ${memberId} returning ${sql(GuildMemberColumns)}`
            if(!member)
                throw new Error(`Could not update non-existent member ${memberId}`)
            return new GuildMember.GuildMember(member)
        }
        const member = await this.get(memberId, { transaction: options?.transaction })
        if(!member)
            throw new Error(`Could not update non-existent member ${memberId} (no changes)`)
        return member
    }
}
