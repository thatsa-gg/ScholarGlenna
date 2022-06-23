import type { Sql } from 'postgres'
import type { DataSource } from './index.js'
import { User } from '../models/User.js'
import { Profile } from '../models/Profile.js'
import type { API } from '../models/API.js'

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

export class ProfileRepository {
    #sql: Sql<{}>
    #dataSource: DataSource
    constructor(sql: Sql<{}>, dataSource: DataSource){
        this.#sql = sql
        this.#dataSource = dataSource
    }

    async create(user: User.User, info: API.DiscordUserInfo): Promise<Profile.Profile> {
        const [ profile ] = await this.#sql<{ profile_id: number }[]>`
            insert into Profiles ${this.#sql({
                user_id: user.id,
                avatar: info.avatar
            })} returning profile_id
        `
        if(typeof profile?.profile_id !== 'number')
            throw new Error(`Fatal database error ocurred while trying to register new user profile.`)
        const entity = await this.get(profile.profile_id)
        if(!entity)
            throw new Error(`Could not load profile data for ID ${profile.profile_id}`)
        return entity
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

    async findOrCreate(info: API.DiscordUserInfo): Promise<Profile.Profile> {
        const user = await this.#dataSource.Users.findOrCreate(info)
        const profile = await this.getForUser(user)
        if(profile)
            return profile
        return await this.create(user, info)
    }
}
