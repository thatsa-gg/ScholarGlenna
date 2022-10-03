import { Prisma, Team, Guild } from '../../generated/client/index.js'
import type { Transactionable } from './Client.js'
import type { Database } from '.'
import type { Guild as DiscordGuild } from 'discord.js'

type UpdateTeamInfo = null | Pick<Team, 'team_id' | 'alias' | 'snowflake' | 'name' | 'description' | 'role' | 'channel'>
export type TeamInfo =
    Pick<Team, 'name' | 'description' | 'role' | 'channel'>
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
            channel: source.channel,
            icon: role?.icon,
            color: role?.color,
            created_at: now,
            updated_at: now
        }})
    }

    async create(source: TeamInfo, guild: DiscordGuild, targetGuild: Pick<Guild, 'guild_id' | 'snowflake' | 'name'>): Promise<Team> {
        const correlation_id = await this.#database.newSnowflake()
        const Import = this.#database.Import
        await guild.members.fetch() // populate member cache so roles actually list their members
        return await this.#database.Client.$transaction<Team>(async client => {
            const snowflake = await this.#database.newSnowflake()
            const role = source.role ? await guild.roles.fetch(source.role.toString()) : null
            const team = await client.team.create({
                data: {
                    guild_id: targetGuild.guild_id,
                    snowflake,
                    alias: source.alias?.toLowerCase() ?? snowflake.toString(36),
                    name: source.name,
                    description: source.description,
                    role: source.role,
                    channel: source.channel,
                    icon: role?.icon,
                    color: role?.color
                }
            })
            await client.history.create({
                data: {
                    correlation_id,
                    event_type: 'TeamCreate',
                    actor_name: 'ScholarGlenna',
                    guild_snowflake: targetGuild.snowflake,
                    guild_name: targetGuild.name,
                    team_id: team.team_id,
                    team_name: team.name
                }
            })

            if(role){
                await client.importGuildMembers.createMany({
                    data: Array.from(role.members.values(), member => ({
                        user_snowflake: BigInt(member.id),
                        guild_id: targetGuild.guild_id,
                        username: member.user.username,
                        discriminator: Number.parseInt(member.user.discriminator),
                        nickname: member.nickname,
                        user_avatar: member.user.avatar,
                        guild_avatar: member.avatar
                    }))
                })
                await client.importTeamMembers.createMany({
                    data: Array.from(role.members.values(), member => ({
                        user_snowflake: BigInt(member.id),
                        team_id: team.team_id
                    }))
                })
                await Import.syncMembers(client, correlation_id, team)
                await Import.importCleanup(client)
            }

            return team
        })
    }

    async isValid(candidate: TeamInfo, guild: DiscordGuild, targetGuild: Pick<Guild, 'guild_id'>): Promise<[ boolean, string[] ]> {
        const messages = []
        console.log({ checking: candidate })
        if(candidate.name === '')
            messages.push(`Name cannot be empty.`)
        else if(/[^a-zA-Z\-0-9 ]/.test(candidate.name))
            messages.push(`Name contains illegal characters. Names must be only letters, numbers, hyphens, or spaces.`)
        if(candidate.role !== null) {
            const guildRole = await guild.roles.fetch(candidate.role.toString())
            if(!guildRole)
                messages.push(`Role does not exist in the guild.`)
            else {
                const team = await this.#database.Client.team.findUnique({
                    where: { role: candidate.role },
                    select: { name: true }
                })
                if(team)
                    messages.push(`Role ${guildRole.name} is already in use by team ${team.name}.`)
            }
        }
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

    async removeTeamChannel(channelId: bigint, options?: Transactionable & { correlationId?: bigint }){
        const client = options?.client ?? this.#database.Client
        await client.$executeRaw`
            call remove_team_channel(
                ${channelId}::snowflake,
                ${options?.correlationId ?? Prisma.sql`new_snowflake()`}::snowflake
            )
        `
    }

    async removeTeamRole(roleId: BigInt, options?: Transactionable & { correlationId?: bigint }){
        const client = options?.client ?? this.#database.Client
        await client.$executeRaw`
            call remove_team_role(
                ${roleId}::snowflake,
                ${options?.correlationId ?? Prisma.sql`new_snowflake()`}::snowflake
            )
        `
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
