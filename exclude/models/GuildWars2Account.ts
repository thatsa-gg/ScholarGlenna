import { Column, Entity, ManyToOne } from 'typeorm'
import { User } from './User.js'
import { DBEntity } from './_DBEntity.js'

@Entity()
export class GuildWars2Account extends DBEntity {
    @Column()
    name!: string

    @Column()
    apiKey!: string

    @Column()
    verified!: boolean

    @ManyToOne(() => User, user => user.accounts)
    user!: Promise<User>
}
