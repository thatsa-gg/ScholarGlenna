import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";

@Entity()
export class Build {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    createdBy: string

    @Column()
    updatedBy: string

    @Column()
    createdAt: Date

    @Column()
    updatedAt: Date

    @ManyToMany(_type => BuildAlias, alias => alias.builds, { cascade: true })
    aliases: BuildAlias[]
}

@Entity()
export class BuildAlias {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToMany(_type => Build, build => build.aliases)
    builds: Build[]
}
