import type { Sql } from 'postgres'
import type { DataSource } from './index.js'
import type { User } from '../models/User.js'
import type { Profile } from '../models/Profile.js'
import { Guild } from '../models/Guild.js'
import type { API } from '../models/API.js'
import type { Guild as DiscordGuild } from 'discord.js'

export interface GuildInfo {
    guild_id: number
    snowflake: string
    name: string
    icon: string | null
    description: string | null
    preferred_locale: string
    owner_id: number
    manager_id: number
    moderator_role: string | null
    updated_at: Date
    created_at: Date
    deleted_at: Date | null
}

export class GuildRepository {
    #sql: Sql<{}>
    #dataSource: DataSource
    constructor(sql: Sql<{}>, dataSource: DataSource){
        this.#sql = sql
        this.#dataSource = dataSource
    }

    async create(owner: User.User, manager: Profile.Profile, info: API.DiscordGuildInfo): Promise<Guild.Guild> {
        const [ guild ] = await this.#sql<{ guild_id: number }[]>`
            insert into Guilds ${this.#sql({
                snowflake: info.id,
                name: info.name,
                description: info.description || null,
                icon: info.icon || null,
                preferred_locale: info.preferredLocale,
                owner_id: owner.id,
                manager_id: manager.id
            })} returning guild_id
        `
        if(typeof guild?.guild_id !== 'number')
            throw new Error(`Fatal database error ocurred while trying to register new guild.`)
        const entity = await this.get(guild.guild_id)
        if(!entity)
            throw new Error(`Could not load guild data for ID ${guild.guild_id}`)
        return entity
    }

    async get(id: number): Promise<Guild.Guild | null> {
        const [ guild ] = await this.#sql<GuildInfo[]>`
            select * from Guilds where guild_id = ${id}
        `
        if(!guild)
            return null
        return new Guild.Guild(guild)
    }

    async getBySnowflake(snowflake: string): Promise<Guild.Guild | null> {
        const [ guild ] = await this.#sql<GuildInfo[]>`
            select * from Guilds where snowflake = ${snowflake}
        `
        if(!guild)
            return null
        return new Guild.Guild(guild)
    }

    async restore(guild: Guild.Guild): Promise<Guild.Guild> {
        const [ _guild ] = await this.#sql<GuildInfo[]>`
            update Guilds set deleted_at = null where guild_id = ${guild.id} returning *
        `
        if(!_guild)
            throw new Error(`Could not restore non-existent guild "${guild.name}" (id: ${guild.id})`)
        return new Guild.Guild(_guild)
    }

    async findOrCreate(info: API.DiscordGuildInfo): Promise<Guild.Guild> {
        const guild = await this.getBySnowflake(info.id)
        if(guild){
            if(guild.deletedAt)
                return await this.restore(guild)
            else
                return guild
        }
        // TODO: proper owner, manager
        const owner = await this.#dataSource.Users.get(1)
        const manager = await this.#dataSource.Profiles.get(1)
        return await this.create(owner!, manager!, info)
    }

    async updateOrRestore(info: API.DiscordGuildInfo, options?: { create: boolean }): Promise<Guild.Guild> {
        const guild = await this.getBySnowflake(info.id)
        if(!guild){
            if(options?.create){
                const user = await this.#dataSource.Users.get(1)
                const profile = await this.#dataSource.Profiles.get(1)
                return await this.create(user!, profile!, info)
            }
            throw new Error(`Tried to update or restore a non-existent guild "${info.name}."`)
        }
        // TODO: only update if it needs updating
        const [ _guild ] = await this.#sql<GuildInfo[]>`
            update Guilds set ${this.#sql({
                name: info.name,
                description: info.description || null,
                icon: info.icon || null,
                preferred_locale: info.preferredLocale,
                // TODO owner_id: owner.id,
                // TODO manager_id: manager.id
            })}
            where guild_id = ${guild.id}
            returning *
        `
        if(!_guild)
            throw new Error(`Could not update non-existent guild "${guild.name}" (id: ${guild.id})`)
        return new Guild.Guild(_guild)
    }

    async import(target: Guild.Guild, source: DiscordGuild){
        const members = await source.members.fetch()
        for(const [, member] of members){
            console.log(`Importing member ${member.displayName}/${member.id} (${member.user.username}#${member.user.discriminator}/${member.user.id})`)
            // TODO
        }
    }
}
