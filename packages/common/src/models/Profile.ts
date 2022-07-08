import type { DataSource } from '../database/index.js'
import type { User } from './User.js'
import type { UserProfileInfo } from '../database/ProfileRepository.js'

interface ProfileInfo extends User {
    avatar: string
}

export type LocalProfile = Pick<Profile, 'avatar' | 'username' | 'discriminator' | 'snowflake'> & {
    displayName: string
    user_id: number
}

export type Profile = ProfileInfo
export namespace Profile {
    export class Profile {
        id: number
        updated_at: Date
        created_at: Date
        snowflake: string
        avatar: string
        username: string
        discriminator: number
        #user_id: number

        get displayName(){ return `${this.username}#${this.discriminator.toString().padStart(4, '0')}` }
        getUser(dataSource: DataSource){ return dataSource.Users.get(this.#user_id) }
        getLocalProfile(): LocalProfile {
            return {
                user_id: this.#user_id,
                avatar: this.avatar,
                username: this.username,
                discriminator: this.discriminator,
                snowflake: this.snowflake,
                displayName: this.displayName
            }
        }

        constructor(info: UserProfileInfo){
            this.id = info.profile_id
            this.created_at = info.created_at
            this.updated_at = info.updated_at
            this.snowflake = info.snowflake
            this.avatar = info.avatar
            this.username = info.username
            this.discriminator = info.discriminator
            this.#user_id = info.user_id
        }
    }
}
