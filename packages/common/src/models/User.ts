import { DiscordEntity } from './DBEntity.js'
import type { UserInfo as DBUserInfo } from '../database/UserRepository.js'

interface UserInfo {
    snowflake: string
    username: string
    discriminator: number
}

export type User = UserInfo
export namespace User {
    export function isUser(candidate: any): candidate is User {
        return candidate && candidate instanceof User
    }
    export class User extends DiscordEntity implements UserInfo {
        username: string
        discriminator: number
        get displayName(){ return `${this.username}#${this.discriminator.toString().padStart(4, '0')}` }

        constructor(properties: DBUserInfo){
            super({ id: properties.user_id, ...properties })
            this.username = properties.username
            this.discriminator = properties.discriminator
        }
    }
}
