import { DBEntity } from './DBEntity.js'
import type { GuildMemberInfo as DBGuildMemberInfo } from '../database/GuildMemberRepository.js'
import type { User } from './User.js'
import type { Guild } from './Guild.js'
import type { DataSource } from '../database/index.js'

export namespace GuildMember {
    export class GuildMember extends DBEntity {
        userId: number
        guildId: number
        nickname: string | null
        avatar: string | null

        async getUser(dataSource: DataSource): Promise<User.User> {
            const user = await dataSource.Users.get(this.userId)
            if(!user)
                throw new Error(`Could not get user ${this.userId}`)
            return user
        }

        async getGuild(dataSource: DataSource): Promise<Guild.Guild> {
            const guild = await dataSource.Guilds.get(this.guildId)
            if(!guild)
                throw new Error(`Could not get guild ${this.guildId}`)
            return guild
        }

        constructor(properties: DBGuildMemberInfo){
            super({ id: properties.member_id, ...properties })
            this.userId = properties.user_id
            this.guildId = properties.guild_id
            this.nickname = properties.nickname
            this.avatar = properties.avatar
        }
    }
}
