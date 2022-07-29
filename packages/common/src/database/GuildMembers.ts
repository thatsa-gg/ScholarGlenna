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

    async prune(options?: Transactionable){
        const client = options?.client ?? this.#database.Client
        await client.$executeRaw`
            delete from
                GuildMembers
            using
                GuildMemberReferenceCount
            where
                GuildMembers.guild_member_id = GuildMemberReferenceCount.guild_member_id
                and GuildMemberReferenceCount.Count = 0;
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
