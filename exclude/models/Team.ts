import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { Guild } from './Guild.js'
import { TeamMember } from './TeamMember.js'
import { DBEntity } from './_DBEntity.js'

@Entity()
export class Team extends DBEntity {
    @Column()
    name!: string

    @Column()
    description!: string

    @Column({ type: 'smallint' })
    dayOfWeek!: number

    @Column({ type: 'time' })
    time!: Date

    @Column({ type: 'varchar', length: 32, nullable: true })
    color!: string | null

    @Column({ type: 'varchar', nullable: true })
    icon!: string | null

    @Column({ nullable: true })
    channel!: string

    @Column()
    role!: string

    @ManyToOne(() => Guild, guild => guild.teams)
    guild!: Promise<Guild>

    @OneToMany(() => TeamMember, member => member.team)
    members!: Promise<TeamMember[]>
}
