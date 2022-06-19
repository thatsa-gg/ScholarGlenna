import type { DiscordUserInfo } from '$lib/discord-rest'
import type { APIUser } from 'discord-api-types/v10'
import { Entity, Index, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number = null!

    @Index({ unique: true })
    @Column()
    snowflake: APIUser['id'] = null!

    @Column({ type: 'varchar', length: 32 })
    username: APIUser['username'] = null!

    @Column({ type: 'char', length: 4 })
    discriminator: APIUser['discriminator'] = null!

    @Column()
    avatar: APIUser['avatar'] = null

    constructor(info?: DiscordUserInfo){
        if(info){
            this.snowflake = info.id
            this.username = info.username
            this.discriminator = info.discriminator
            this.avatar = info.avatar
        }
    }
}
