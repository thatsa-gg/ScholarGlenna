import type { Prisma, Team, Guild } from '../../generated/client'
import type { Transactionable } from './Client.js'
import type { Database } from '.'
import type { Guild as DiscordGuild } from 'discord.js'

type UpdateTeamInfo = null | Pick<Team, 'team_id' | 'alias' | 'snowflake' | 'name' | 'description' | 'role' | 'channel' | 'sync'>
export type TeamInfo =
    Pick<Team, 'name' | 'description' | 'role' | 'channel' | 'sync'>
    & Partial<Pick<Team, 'alias'>>
export class Teams {
    #database: Database
    constructor(database: Database){ this.#database = database }
    async upsert(source: TeamInfo, target: UpdateTeamInfo, discordGuild: DiscordGuild, targetGuild: Pick<Guild, 'guild_id'>, options?: Transactionable): Promise<Team> {
        const db = options?.client ?? this.#database.Client
        const data = {} as Prisma.TeamCreateInput & Prisma.TeamUpdateInput
        const snowflake = target?.snowflake ?? await this.#database.newSnowflake()
        const role = source.role ? await discordGuild.roles.fetch(source.role.toString()) : null
        if(target?.alias !== source.alias)
            data.alias = source.alias ?? snowflake?.toString(36)
        if(target?.name !== source.name)
            data.name = source.name
        if(target?.description !== source.description)
            data.description = source.description
        if(target?.sync !== source.sync)
            data.sync = source.sync
        if(target?.channel !== source.channel)
            data.channel = source.channel
        if(target?.role !== source.role){
            data.role = source.role
            data.icon = role?.icon
            data.color = role?.color
        }
        const update = { ...data }
        const now = new Date()
        if(target && Object.keys(data).length > 0)
            update.updated_at = now
        return await db.team.upsert({ ...Teams.whereTeamGuild(snowflake, targetGuild), update, create: {
            guild_id: targetGuild.guild_id,
            snowflake: snowflake,
            alias: source.alias ?? snowflake?.toString(36),
            name: source.name,
            description: source.description,
            role: source.role,
            sync: source.sync,
            channel: source.channel,
            icon: role?.icon,
            color: role?.color,
            created_at: now,
            updated_at: now
        }})
    }

    async create(source: TeamInfo, guild: DiscordGuild, targetGuild: Pick<Guild, 'guild_id'>, options?: Transactionable){
        const client = options?.client ?? this.#database.Client
        const snowflake = await this.#database.newSnowflake()
        const role = source.role ? await guild.roles.fetch(source.role.toString()) : null
        return await client.team.create({
            data: {
                guild_id: targetGuild.guild_id,
                snowflake,
                alias: source.alias ?? snowflake.toString(36),
                name: source.name,
                description: source.description,
                role: source.role,
                sync: source.sync,
                channel: source.channel,
                icon: role?.icon,
                color: role?.color
            }
        })
    }

    async isValid(candidate: any, guild: DiscordGuild, targetGuild: Pick<Guild, 'guild_id'>): Promise<[ boolean, ...string[] ]> {
        return [ false ]
    }
}
export namespace Teams {
    export function whereTeamGuild(snowflake: bigint, guild: Pick<Guild, 'guild_id'>): { where: Prisma.TeamWhereUniqueInput } {
        return {
            where: {
                guild_id_snowflake: {
                    guild_id: guild.guild_id,
                    snowflake
                }
            }
        }
    }
}
