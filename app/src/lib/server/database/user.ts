import type { APIUser } from 'discord-api-types/v10'
import { createSqlTag, type DatabaseTransactionConnection } from 'slonik'
import { z } from 'zod'
import { UserTable } from './tables'

const sql = createSqlTag({
    typeAliases: {
        void: z.object({}).strict(),
        userId: z.object({
            userId: UserTable.UserId.Type,
        }).strict(),
        userSummary: z.object({
            userId: UserTable.UserId.Type,
            discordId: UserTable.DiscordId.Type,
            name: UserTable.Name.Type,
            avatar: UserTable.Avatar.Type,
        }).strict()
    }
})

export namespace User {
    export async function findByName(connection: DatabaseConnection, name: string){
        const result = await connection.maybeOne(sql.typeAlias("userSummary")`
            select
                user_id as "userId",
                discord_id as "discordId",
                name,
                avatar
            from discord.user
            where name = ${name}
        `)
        if(null == result)
            return null
        return {
            ...result
        }
    }

    export async function prune(connection: DatabaseConnection){
        await connection.query(sql.typeAlias("void")`
            delete from discord.user where not exists (
                select 1 from discord.user
                    left outer join discord.guildmember using(user_id)
                    left outer join app.profile using(user_id)
                where guild_member_id <> NULL or profile_id <> NULL
            );
        `)
    }

    export async function isVisible(connection: DatabaseConnection, sessionProfile: Nullable<{ profileId: number }>, slug: string){
        // 1. if profile is for current user, true
        // 2. if profile shares guild with user and visibility = SameGuild, true
        // 3. if visibility = Public, true
        // 4. else, false
    }

    export async function createOrUpdate(connection: DatabaseTransactionConnection, user: APIUser){
        return await connection.one(sql.typeAlias("userId")`
            insert into discord.user(discord_id, name, avatar) values (
                ${user.id},
                ${user.username},
                ${user.avatar}
            )
            on conflict (discord_id) do update set
                (name, avatar) = (excluded.name, excluded.avatar)
            returning user_id as "userId"
        `)
    }
}
