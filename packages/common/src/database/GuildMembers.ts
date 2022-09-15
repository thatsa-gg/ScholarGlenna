import type { GuildMember as DiscordGuildMember } from 'discord.js'
import type { Prisma, GuildMember, User, Guild, GuildRole } from '../../generated/client'
import type { Transactionable } from './Client.js'
import type { Database } from '.'

type UpdateMemberInfo = null | Pick<GuildMember, 'guild_member_id' | 'avatar' | 'nickname' | 'role' | 'deleted_at'>
export class GuildMembers {
    #database: Database
    constructor(database: Database){ this.#database = database }
    async upsert(source: DiscordGuildMember, target: UpdateMemberInfo, targetUser: Pick<User, 'user_id'>, targetGuild: Pick<Guild, 'guild_id'>, options?: Transactionable & { role?: GuildRole | null }): Promise<GuildMember> {
        const db = options?.client ?? this.#database.Client
        const data = {} as Prisma.GuildMemberCreateInput & Prisma.GuildMemberUpdateInput
        if(target?.avatar !== source.avatar)
            data.avatar = source.avatar
        if(target?.nickname !== source.nickname)
            data.nickname = source.nickname
        if(options?.role !== undefined && target?.role !== options?.role)
            data.role = options?.role
        if(target?.deleted_at)
            data.deleted_at = null
        const update = { ...data }
        const now = new Date()
        if(target && Object.keys(data).length > 0)
            update.updated_at = now
        return await db.guildMember.upsert({ ...GuildMembers.whereUserGuild(targetUser, targetGuild), update, create: {
            user_id: targetUser.user_id,
            guild_id: targetGuild.guild_id,
            nickname: source.nickname,
            avatar: source.avatar,
            created_at: now,
            updated_at: now,
            role: options?.role ?? null
        }})
    }

    async fetch(source: DiscordGuildMember, guild: Pick<Guild, 'guild_id'>, options: Transactionable & { update: Prisma.GuildMemberUpdateInput, correlationId?: bigint }): Promise<GuildMember & {
        user: { snowflake: bigint },
        vmember: { display_name: string }
    }> {
        const client = options.client ?? this.#database.Client
        const user = await this.#database.Users.fetch(source.user, { client: options?.client, correlationId: options?.correlationId })
        const member = await client.guildMember.upsert({
            where: { user_id_guild_id: { user_id: user.user_id, guild_id: guild.guild_id }},
            update: options.update,
            create: {
                user_id: user.user_id,
                guild_id: guild.guild_id,
                nickname: source.nickname,
                avatar: source.avatar,
                role: options.update.role as GuildRole | undefined | null
            },
            include: {
                user: { select: { snowflake: true, username: true, discriminator: true }},
                vmember: { select: { display_name: true }}
            }
        })
        if(null === member.vmember){
            member.vmember = {
                display_name: `${member.nickname || member.user.username}#${member.user.discriminator}`
            }
        }
        // TODO: guildmemberjoin history if new
        return member as GuildMember & {
            user: { snowflake: bigint },
            vmember: { display_name: string }
        }
    }

    async prune(options?: Transactionable & { correlationId?: bigint }){
        const client = options?.client ?? this.#database.Client
        const correlationId = options?.correlationId ?? await this.#database.newSnowflake()
        await client.$executeRaw`
            call prune_guild_members(${correlationId}::bigint)
        `
    }
}
export namespace GuildMembers {
    export function whereUserGuild(user: Pick<User, 'user_id'>, guild: Pick<Guild, 'guild_id'>): { where: Prisma.GuildMemberWhereUniqueInput } {
        return {
            where: {
                user_id_guild_id: {
                    user_id: user.user_id,
                    guild_id: guild.guild_id
                }
            }
        }
    }
}
