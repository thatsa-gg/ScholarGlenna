import { Column, DataSource, Entity, OneToMany } from 'typeorm'
import { GuildMember } from './GuildMember.js'
import { Team } from './Team.js'
import { DiscordEntity } from './_DBEntity.js'
import type { Guild as DiscordGuild } from 'discord.js'

export interface GuildInfo {
    id: string
    name: string
}

@Entity()
export class Guild extends DiscordEntity {
    @Column()
    name!: string

    @Column({ type: 'varchar', nullable: true })
    moderatorRole!: string | null

    @OneToMany(() => GuildMember, membership => membership.guild)
    members!: Promise<GuildMember[]>

    @OneToMany(() => Team, team => team.guild)
    teams!: Promise<Team[]>

    constructor(guild?: GuildInfo){
        super()
        if(guild){
            this.snowflake = guild.id
            this.name = guild.name
        }
    }
}

export const getRepository = (source: DataSource) => source.getRepository(Guild).extend({
    async import(guild: DiscordGuild): Promise<Guild> {
        await this.importGuildInfo(null!, guild)
        // TODO: check if soft deleted; if so, restore
        // else if not exists: create
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
        const members = await guild.members.fetch()
        for(const [, member] of members){
            console.log(`Importing member ${member.displayName}/${member.id} (${member.user.username}#${member.user.discriminator}/${member.user.id})`)
            // TODO
        }
        // TODO
    },
    async verify(guild: DiscordGuild){
        await this.queryRunner!.startTransaction()
        await this.queryRunner!.commitTransaction()
    }
})
