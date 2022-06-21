import 'reflect-metadata'
import {
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    DataSource
} from 'typeorm'
import type { Guild as DiscordGuild } from 'discord.js'

@Entity()
export class Guild {
    @PrimaryGeneratedColumn()
    id: number = null!

    @Index({ unique: true })
    @Column({ type: 'varchar' })
    snowflake: string = null!

    @Column({ type: 'varchar' })
    name: string = null!

    @CreateDateColumn()
    created_at: Date = null!

    @UpdateDateColumn()
    updated_at: Date = null!

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date | null = null

    constructor(guild?: DiscordGuild){
        if(guild){
            this.snowflake = guild.id
            this.name = guild.name
        }
    }
}

export const getRepository = (source: DataSource) => source.getRepository(Guild).extend({
    async import(guild: DiscordGuild): Promise<Guild> {
        // TODO: check if soft deleted; if so, restore
        // else: create
        // then: import guild info
        return null!
    },
    async findOrCreate(guild: DiscordGuild): Promise<Guild> {
        const entity = await this.findOneBy({ snowflake: guild.id })
        if(entity)
            return entity
        const newGuild = await this.save(new Guild(guild))
        await this.importGuildInfo(newGuild, guild)
        return newGuild
    },

    async importGuildInfo(target: Guild, guild: DiscordGuild){
        for(const [, member] of await guild.members.list()){
            // TODO
        }
        // TODO
    },
})
