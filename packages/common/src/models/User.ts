import 'reflect-metadata'
import type { APIUser } from 'discord-api-types/v10'
import { Entity, Index, Column, PrimaryGeneratedColumn } from 'typeorm'

export interface DiscordUserInfo {
    id: string
    username: string
    discriminator: string
    avatar: string
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number = null!

    @Index({ unique: true })
    @Column({ type: 'varchar' })
    snowflake: APIUser['id'] = null!

    @Column({ type: 'varchar', length: 32 })
    username: APIUser['username'] = null!

    @Column({ type: 'char', length: 4 })
    discriminator: APIUser['discriminator'] = null!

    @Column({ type: 'varchar' })
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
