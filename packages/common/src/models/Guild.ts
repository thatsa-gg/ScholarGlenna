import { DiscordEntity } from './DBEntity.js'
import type { GuildInfo as DBGuildInfo } from '../database/GuildRepository.js'
import type { User } from './User.js'
import type { DataSource } from '../database/index.js'
import type { Profile } from './Profile.js'

interface GuildInfo {
    alias: string
    name: string
    managerRole: string | null
    moderatorRole: string | null
}

export type Guild = GuildInfo
export namespace Guild {
    export function isGuild(candidate: any): candidate is Guild {
        return candidate && candidate instanceof Guild
    }
    export class Guild extends DiscordEntity implements GuildInfo {
        alias: string
        name: string
        icon: string | null
        description: string | null
        preferredLocale: string
        managerRole: string | null
        moderatorRole: string | null
        async getOwner(dataSource: DataSource): Promise<User.User | null> {
            // TODO
            return null
        }
        async getManager(dataSource: DataSource): Promise<Profile.Profile | null> {
            // TODO
            return null
        }

        constructor(properties: DBGuildInfo){
            super({ id: properties.guild_id, ...properties })
            this.alias = properties.alias
            this.name = properties.name
            this.managerRole = properties.manager_role
            this.moderatorRole = properties.moderator_role
            this.icon = properties.icon
            this.description = properties.description
            this.preferredLocale = properties.preferred_locale
        }
        json(){
            return {
                id: this.id,
                name: this.name,
                alias: this.alias,
            }
        }
    }
}
