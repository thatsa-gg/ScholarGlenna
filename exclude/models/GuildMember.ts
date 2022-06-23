import { Column, Entity, ManyToOne } from 'typeorm'
import { DBEntity } from './_DBEntity.js'
import { Guild } from './Guild.js'
import { User } from './User.js'

@Entity()
export class GuildMember extends DBEntity {
    @Column()
    nickname!: string

    @Column()
    avatar!: string

    @ManyToOne(() => User, user => user.memberships)
    user!: Promise<User>

    @ManyToOne(() => Guild, guild => guild.members)
    guild!: Promise<Guild>
}
