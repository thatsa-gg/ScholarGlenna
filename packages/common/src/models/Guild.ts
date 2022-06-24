import { DiscordEntity } from './DBEntity.js'
import type { GuildInfo as DBGuildInfo } from '../database/GuildRepository.js'
import type { User } from './User.js'
import type { DataSource } from '../database/index.js'
import type { Profile } from './Profile.js'

interface GuildInfo {
    name: string
    moderatorRole: string | null
    ownerId: number
    managerId: number
}

export type Guild = GuildInfo
export namespace Guild {
    export function isGuild(candidate: any): candidate is Guild {
        return candidate && candidate instanceof Guild
    }
    export class Guild extends DiscordEntity implements GuildInfo {
        name: string
        icon: string | null
        description: string | null
        preferredLocale: string
        moderatorRole: string | null
        ownerId: number
        managerId: number
        async getOwner(dataSource: DataSource): Promise<User.User | null> {
            return dataSource.Users.get(this.ownerId)
        }
        async getManager(dataSource: DataSource): Promise<Profile.Profile | null> {
            return dataSource.Profiles.get(this.managerId)
        }

        constructor(properties: DBGuildInfo){
            super({ id: properties.guild_id, ...properties })
            this.name = properties.name
            this.ownerId = properties.owner_id
            this.managerId = properties.manager_id
            this.moderatorRole = properties.moderator_role
            this.icon = properties.icon
            this.description = properties.description
            this.preferredLocale = properties.preferred_locale
        }
    }
}
