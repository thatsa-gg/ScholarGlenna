import type { APIGuild, APIGuildMember } from "discord-api-types/v10"
import type { APIGuildMemberWithUser } from "../discord"
import { createSqlTag } from "slonik"
import { z } from "zod"
import { GuildMemberTable } from "./tables"

const sql = createSqlTag({
    typeAliases: {
        void: z.object({}).strict(),
        guildMemberAndUserId: z.object({
            guildMemberId: GuildMemberTable.GuildMemberId.Type,
            userId: GuildMemberTable.UserId.Type,
        }).strict()
    }
})

export namespace GuildMember {
    export async function createOrUpdateWithUser(connection: DatabaseConnection, guild: { guildId: number }, member: APIGuildMemberWithUser){
        return await connection.one(sql.typeAlias("guildMemberAndUserId")`
            with member_user as (
                insert into discord.user(discord_id, name, avatar) values (
                    ${member.user.id},
                    ${member.user.username},
                    ${member.user.avatar}
                )
                on conflict (discord_id) do update set
                    (name, avatar) = (excluded.name, excluded.avatar)
                returning user_id
            )
            insert into discord.guildmember(guild_id, user_id, nickname, avatar)
            select
                ${guild.guildId} as guild_id,
                user_id,
                ${member.nick ?? null} as nickname,
                ${member.avatar ?? null} as avatar
            from member_user
            on conflict (guild_id, user_id) do update set
                (nickname, avatar) = (excluded.nickname, excluded.avatar)
            returning guild_member_id as "guildMemberId", user_id as "userId"
        `)
    }

    export async function createOrUpdate(connection: DatabaseConnection, guild: { guildId: number }, user: { userId: number }, member: APIGuildMember){
        return await connection.one(sql.typeAlias("guildMemberAndUserId")`
            insert into discord.guildmember(guild_id, user_id, nickname, avatar)
            values (
                ${guild.guildId},
                ${user.userId},
                ${member.nick ?? null},
                ${member.avatar ?? null}
            )
            on conflict (guild_id, user_id) do update set
                (nickname, avatar) = (excluded.nickname, excluded.avatar)
            returning guild_member_id as "guildMemberId", user_id as "userId"
        `)
    }

    export async function prune(connection: DatabaseConnection, guild: Pick<APIGuild, 'id'>){
        await connection.query(sql.typeAlias("void")`
            delete from discord.guildmember where exists (
                select 1 from discord.guildmember
                    inner join app.guild using(guild_id)
                    left outer join app.teammember using(guild_member_id)
                where app.guild.discord_id = ${guild.id} and team_member_id = NULL
            )
        `)
    }
}
