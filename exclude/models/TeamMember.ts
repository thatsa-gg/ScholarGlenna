import { Column, Entity, ManyToOne } from 'typeorm'
import { Team } from './Team.js'
import { User } from './User.js'
import { DBEntity } from './_DBEntity.js'

export enum TeamRole {
    Member        = 0,
    PermanentFill = 1,
    Commander     = 2,
    Moderator     = 5,
    Manager       = 6
}

@Entity()
export class TeamMember extends DBEntity {
    @Column({ type: 'smallint' })
    type!: TeamRole

    @ManyToOne(() => Team, team => team.members)
    team!: Promise<Team>

    @ManyToOne(() => User, user => user.teamMemberships)
    user!: Promise<User>
}
