import { Column, DataSource, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { getDataSource } from '../database/index.js'
import { GuildMember } from './GuildMember.js'
import { GuildWars2Account } from './GuildWars2Account.js'
import { TeamMember } from './TeamMember.js'
import { DiscordEntity, DBEntity } from './_DBEntity.js'

export interface UserInfo {
    id: string
    username: string
    discriminator: string
}

@Entity()
export class User extends DiscordEntity {
    @Column({ type: 'varchar', length: 32 })
    username!: string

    @Column({ type: 'int' })
    discriminator!: number

    @OneToMany(() => GuildMember, membership => membership.user)
    memberships!: Promise<GuildMember[]>

    @OneToMany(() => GuildWars2Account, account => account.user)
    accounts!: Promise<GuildWars2Account[]>

    @OneToOne(() => Profile, profile => profile.user, { nullable: true })
    profile!: Promise<Profile | null>

    @OneToMany(() => TeamMember, membership => membership.user)
    teamMemberships!: Promise<TeamMember[]>

    constructor(info?: UserInfo){
        super()
        if(info){
            this.snowflake = info.id
            this.username = info.username
            this.discriminator = Number.parseInt(info.discriminator)
        }
    }
}

export const getUserRepository = (source: DataSource) => source.getRepository(User).extend({
    async findOrCreate(info: UserInfo): Promise<User> {
        const user = await this.findOneBy({ snowflake: info.id })
        if(user)
            return user
        return await this.save(new User(info))
    }
})

export interface ProfileInfo extends UserInfo {
    avatar: string
}

@Entity()
export class Profile extends DBEntity {
    @Column()
    avatar!: string

    @OneToOne(() => User, user => user.profile, { eager: true })
    @JoinColumn()
    user!: User

    constructor();
    constructor(user: User, info: ProfileInfo);
    constructor(...args: [] | [ User, ProfileInfo ]){
        super()
        if(args.length > 0){
            const [ user, info ] = args as [ User, ProfileInfo ]
            this.user = user
            this.avatar = info.avatar
        }
    }
}

export const getProfileRepository = (source: DataSource) => source.getRepository(Profile).extend({
    async findOrCreate(info: ProfileInfo){
        const { Users } = await getDataSource()
        const user = await Users.findOrCreate(info)
        const profile = await user.profile
        if(profile)
            return profile
        return this.save(new Profile(user, info))
    }
})
