import type { Sql, TransactionSql } from 'postgres'
import type { DataSource } from './index.js'
import { User } from '../models/User.js'
import { Profile } from '../models/Profile.js'
import type { API } from '../models/API.js'
import type { User as DiscordUser } from 'discord.js'

export interface UserProfileInfo {
    profile_id: number
    user_id: number
    snowflake: string
    username: string
    discriminator: number
    avatar: string
    updated_at: Date
    created_at: Date
    deleted_at: Date | null
}
const UserProfileColumns: (keyof UserProfileInfo)[] = [
    'profile_id',
    'user_id',
    'snowflake',
    'username',
    'discriminator',
    'avatar',
    'created_at',
    'updated_at',
    'deleted_at',
]

export class ProfileRepository {
    #sql: Sql<{}>
    #dataSource: DataSource
    constructor(sql: Sql<{}>, dataSource: DataSource){
        this.#sql = sql
        this.#dataSource = dataSource
    }

    async create(user: User.User, source: DiscordUser, options?: { transaction?: TransactionSql<{}> }): Promise<Profile.Profile> {
        const sql = options?.transaction ?? this.#sql
        const [ profile ] = await sql<UserProfileInfo[]>`
            insert into Profiles ${this.#sql({
                user_id: user.id,
                avatar: source.avatar
            })} returning ${sql(UserProfileColumns)}
        `
        if(!profile)
            throw new Error(`Fatal database error ocurred while trying to register new user profile.`)
        return new Profile.Profile(profile)
    }

    async get(id: number): Promise<Profile.Profile | null> {
        const [ profile ] = await this.#sql<UserProfileInfo[]>`
            select * from UserProfiles where profile_id = ${id}
        `
        if(!profile)
            return null
        return new Profile.Profile(profile)
    }

    getForUser(id: number): Promise<Profile.Profile>;
    getForUser(user: User.User): Promise<Profile.Profile>;
    async getForUser(target: number | User): Promise<Profile.Profile | null> {
        const id: number = User.isUser(target) ? target.id : target as number
        const [ profile ] = await this.#sql<UserProfileInfo[]>`
            select * from UserProfiles where user_id = ${id}
        `
        if(!profile)
            return null
        return new Profile.Profile(profile)
    }

    async findOrCreate(source: DiscordUser): Promise<Profile.Profile> {
        const user = await this.#dataSource.Users.findOrCreate(source)
        const profile = await this.getForUser(user)
        if(profile)
            return profile
        return await this.create(user, source)
    }
}
