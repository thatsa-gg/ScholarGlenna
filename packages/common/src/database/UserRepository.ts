import type { Sql, Helper } from 'postgres'
import type { DataSource, Transactable } from './index.js'
import { User } from '../models/User.js'
import type { User as DiscordUser } from 'discord.js'

export interface UserInfo {
    user_id: number
    snowflake: string
    username: string
    discriminator: number
    updated_at: Date
    created_at: Date
    deleted_at: Date | null
}
type UpdateUserInfo = Omit<UserInfo, 'snowflake' | 'created_at' | 'updated_at'>

const UserColumns: (keyof UserInfo)[] = [
    'user_id',
    'snowflake',
    'username',
    'discriminator',
    'created_at',
    'updated_at',
    'deleted_at'
]

export class UserRepository {
    #sql: Sql<{}>
    constructor(sql: Sql<{}>, _dataSource: DataSource){
        this.#sql = sql
    }

    async create(source: DiscordUser, options?: Transactable): Promise<User.User> {
        const sql = options?.transaction ?? this.#sql
        const [ user ] = await sql<[ UserInfo ]>`
            insert into Users ${sql({
                snowflake: source.id,
                username: source.username,
                discriminator: source.discriminator
            })} returning ${sql(UserColumns)}
        `
        if(!user)
            throw new Error(`Fatal database error ocurred while trying to register new user entity.`)
        return new User.User(user)
    }

    async get(id: number, options?: Transactable): Promise<User.User | null> {
        const sql = options?.transaction ?? this.#sql
        const [ user ] = await sql<UserInfo[]>`
            select ${sql(UserColumns)} from Users where user_id = ${id}
        `
        if(!user)
            return null
        return new User.User(user)
    }

    async getBySnowflake(snowflake: string, options?: Transactable): Promise<User.User | null> {
        const sql = options?.transaction ?? this.#sql
        const [ user ] = await sql<UserInfo[]>`
            select ${sql(UserColumns)} from Users where snowflake = ${snowflake}
        `
        if(!user)
            return null
        return new User.User(user)
    }

    async update(source: DiscordUser, target: UpdateUserInfo | User.User, options?: Transactable & { restore?: boolean }): Promise<User.User> {
        const sql = options?.transaction ?? this.#sql
        const properties = {} as Record<keyof UpdateUserInfo | 'updated_at', string | number | Helper<any> | null>
        if(target.username !== source.username)
            properties.username = source.username
        const discriminator = Number.parseInt(source.discriminator)
        if(target.discriminator !== discriminator)
            properties.discriminator = discriminator
        const userId = target instanceof User.User ? target.id : target.user_id
        if(Object.keys(properties).length > 0){
            properties.updated_at = sql(`now()`)
            const [ user ] = await sql<[ UserInfo ]>`update Users set ${sql(properties)} where user_id = ${userId} returning ${sql(UserColumns)}`
            if(!user)
                throw new Error(`Could not update non-existent user "${target.username}" (id: ${userId})`)
            return new User.User(user)
        }
        const user = await this.get(userId, { transaction: options?.transaction })
        if(!user)
            throw new Error(`Could not update non-existent user "${target.username}" (id: ${userId}) (no changes)`)
        return user
    }

    async findOrCreate(source: DiscordUser, options?: Transactable): Promise<User.User> {
        const user = await this.getBySnowflake(source.id, { transaction: options?.transaction })
        if(!user)
            return await this.create(source, { transaction: options?.transaction })
        return await this.update(source, user, { restore: true, transaction: options?.transaction })
    }
}
