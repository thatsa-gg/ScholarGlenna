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
            alias: source.alias || snowflake?.toString(36),
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

    async isValid(candidate: TeamInfo, guild: DiscordGuild, targetGuild: Pick<Guild, 'guild_id'>): Promise<[ boolean, string[] ]> {
        const messages = []
        console.log({ checking: candidate })
        if(candidate.name === '')
            messages.push(`Name cannot be empty.`)
        else if(/[^a-zA-Z\-0-9 ]/.test(candidate.name))
            messages.push(`Name contains illegal characters. Names must be only letters, numbers, hyphens, or spaces.`)
        if(candidate.sync && candidate.role === null)
            messages.push(`A team must have a role for sync to be enabled.`)
        if(candidate.role !== null && null === await guild.roles.fetch(candidate.role.toString()))
            messages.push(`Role does not exist in the guild.`)
        if(candidate.channel !== null && null === await guild.channels.fetch(candidate.channel.toString()))
            messages.push(`Channel does not exist in the guild.`)
        if(candidate.alias && await this.#database.Client.team.findUnique({
            where: {
                guild_id_alias: {
                    alias: candidate.alias,
                    guild_id: targetGuild.guild_id
                }
            },
            select: { _count: true }
        }))
            messages.push(`Cannot use duplicate alias ${candidate.alias}.`)
        return [ messages.length === 0, messages ]
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
