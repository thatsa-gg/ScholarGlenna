import type { DataSource } from '../database/index.js'
import { DiscordEntity } from './DBEntity.js'
import type { User } from './User.js'
import type { UserProfileInfo } from '../database/ProfileRepository.js'

interface ProfileInfo extends User {
    avatar: string
}

export type Profile = ProfileInfo
export namespace Profile {
    export class Profile extends DiscordEntity {
        avatar: string
        username: string
        discriminator: number
        #user_id: number

        get displayName(){ return `${this.username}#${this.discriminator.toString().padStart(4, '0')}` }
        getUser(dataSource: DataSource){ return dataSource.Users.get(this.#user_id) }

        constructor(info: UserProfileInfo){
            super({ id: info.profile_id, ...info })
            this.avatar = info.avatar
            this.username = info.username
            this.discriminator = info.discriminator
            this.#user_id = info.user_id
        }
    }
}
