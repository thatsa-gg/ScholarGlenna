import type { Helper, Sql } from 'postgres'
import type { DataSource, Transactable } from './index.js'
import { User } from '../models/User.js'
import { Profile } from '../models/Profile.js'
import type { User as DiscordUser } from 'discord.js'

interface ProfileInfo {
    avatar: string
    updated_at: Date
    created_at: Date
}
export interface UserProfileInfo extends ProfileInfo {
    profile_id: number
    user_id: number
    snowflake: string
    username: string
    discriminator: number
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
]

export class ProfileRepository {
    #sql: Sql<{}>
    #dataSource: DataSource
    constructor(sql: Sql<{}>, dataSource: DataSource){
        this.#sql = sql
        this.#dataSource = dataSource
    }

    async create(user: User.User, source: DiscordUser, options?: Transactable): Promise<Profile.Profile> {
        const sql = options?.transaction ?? this.#sql
        const [ profileId ] = await sql<[{ profile_id: number }]>`
            insert into Profiles ${this.#sql({
                user_id: user.id,
                avatar: source.avatar
            })} returning profile_id
        `
        if(!profileId)
            throw new Error(`Fatal database error ocurred while trying to register new user profile.`)
        const [ profile ] = await sql<[ UserProfileInfo ]>`select ${sql(UserProfileColumns)} from UserProfiles where profile_id = ${profileId.profile_id}`
        if(!profile)
            throw new Error(`Could not retreive info for new profile.`)
        return new Profile.Profile(profile)
    }

    async update(source: DiscordUser, target: UserProfileInfo | Profile.Profile, options?: Transactable): Promise<Profile.Profile> {
        const sql = options?.transaction ?? this.#sql
        const properties = {} as Record<keyof ProfileInfo, string | Helper<any> | null>
        if(target.avatar !== source.avatar)
            properties.avatar = source.avatar
        const profileId = target instanceof Profile.Profile ? target.id : target.profile_id
        if(Object.keys(properties).length > 0){
            properties.updated_at = sql(`now()`)
            const result = await sql`update Profiles set ${sql(properties)} where profile_id = ${profileId}`
            if(!result.count)
                throw new Error(`Could not update profile ID: ${profileId}.`)
            const profile = await this.get(profileId, { transaction: sql })
            if(!profile)
                throw new Error(`Could not fetch updated profile ID: ${profileId}.`)
            return profile
        }
        const profile = await this.get(profileId, { transaction: sql })
        if(!profile)
            throw new Error(`Could not fetch updated profile ID: ${profileId} (no changes)`)
        return profile
    }

    async get(id: number, options?: Transactable): Promise<Profile.Profile | null> {
        const sql = options?.transaction ?? this.#sql
        const [ profile ] = await sql<UserProfileInfo[]>`
            select * from UserProfiles where profile_id = ${id}
        `
        if(!profile)
            return null
        return new Profile.Profile(profile)
    }

    getForUser(id: number, options?: Transactable): Promise<Profile.Profile>;
    getForUser(user: User.User, options?: Transactable): Promise<Profile.Profile>;
    async getForUser(target: number | User, options?: Transactable): Promise<Profile.Profile | null> {
        const sql = options?.transaction ?? this.#sql
        const id: number = User.isUser(target) ? target.id : target as number
        const [ profile ] = await sql<UserProfileInfo[]>`
            select * from UserProfiles where user_id = ${id}
        `
        if(!profile)
            return null
        return new Profile.Profile(profile)
    }

    async findOrCreate(source: DiscordUser, options?: Transactable): Promise<Profile.Profile> {
        const sql = options?.transaction ?? this.#sql
        const user = await this.#dataSource.Users.findOrCreate(source, { transaction: sql })
        const profile = await this.getForUser(user)
        if(profile)
            return await this.update(source, profile, { transaction: sql })
        return await this.create(user, source)
    }

    async import(source: DiscordUser): Promise<Profile.Profile> {
        return await this.#sql.begin(async sql => {
            const user = await this.#dataSource.Users.findOrCreate(source, { transaction: sql })
            const [ exists ] = await sql<[ UserProfileInfo ]>`
                select * from UserProfiles where user_id = ${user.id}
            `
            const profile = exists
                ? await this.update(source, exists, { transaction: sql })
                : await this.create(user, source, { transaction: sql })
            return profile
        })
    }
}
