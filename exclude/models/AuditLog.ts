import {
    ChildEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    TableInheritance
} from 'typeorm'
import { Guild } from './Guild.js'
import { User } from './User.js'

@Entity()
@TableInheritance({
    column: {
        type: 'varchar',
        name: 'type'
    }
})
export class AuditLog {
    @PrimaryGeneratedColumn()
    id!: number

    @CreateDateColumn()
    createdAt!: Date

    @Column()
    action!: string
}

export namespace AuditLog {
    @ChildEntity()
    export class GuildLog extends AuditLog {
        @ManyToOne(() => Guild)
        @Column({ name: 'source_id' })
        guild!: Guild

        declare action: 'create' | 'destroy' | 'set'
    }

    @ChildEntity()
    export class UserLog extends AuditLog {
        @ManyToOne(() => User)
        @Column({ name: 'source_id' })
        user!: User
    }
}
