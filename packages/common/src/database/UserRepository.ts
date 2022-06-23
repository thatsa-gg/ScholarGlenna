import type { Sql } from 'postgres'
import type { DataSource } from './index.js'
import { User } from '../models/User.js'
import type { API } from '../models/API.js'

export interface UserInfo {
    user_id: number
    snowflake: string
    username: string
    discriminator: number
    updated_at: Date
    created_at: Date
    deleted_at: Date | null
}

export class UserRepository {
    #sql: Sql<{}>
    #dataSource: DataSource
    constructor(sql: Sql<{}>, dataSource: DataSource){
        this.#sql = sql
        this.#dataSource = dataSource
    }

    async create(info: API.DiscordUserInfo): Promise<User.User> {
        const [ user ] = await this.#sql<{ user_id: number }[]>`
            insert into Users ${this.#sql({
                snowflake: info.id,
                username: info.username,
                discriminator: info.discriminator
            })} returning user_id
        `
        if(typeof user?.user_id !== 'number')
            throw new Error(`Fatal database error ocurred while trying to register new user entity.`)
        return (await this.get(user.user_id))!
    }

    async get(id: number): Promise<User.User | null> {
        const [ user ] = await this.#sql<UserInfo[]>`
            select * from Users where user_id = ${id}
        `
        if(!user)
            return null
        return new User.User(user)
    }

    async getBySnowflake(snowflake: string): Promise<User.User | null> {
        const [ user ] = await this.#sql<UserInfo[]>`
            select * from Users where snowflake = ${snowflake}
        `
        if(!user)
            return null
        return new User.User(user)
    }

    async findOrCreate(info: API.DiscordUserInfo): Promise<User.User> {
        const user = await this.getBySnowflake(info.id)
        if(user)
            return user
        return await this.create(info)
    }
}
