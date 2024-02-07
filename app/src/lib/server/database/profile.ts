import type { APIUser } from "discord-api-types/v10"
import { createSqlTag, type DatabaseConnection } from 'slonik'
import { z } from 'zod'
import { UserTable, ProfileTable } from "./tables"
import { AppUrl } from ".."

const sql = createSqlTag({
    typeAliases: {
        userSummary: z.object({
            userId: UserTable.UserId.Type,
            discordId: UserTable.DiscordId.Type,
            name: UserTable.Name.Type,
            avatar: UserTable.Avatar.Type,
        }).strict(),
        profileSummary: z.object({
            profileId: ProfileTable.ProfileId.Type,
            discordId: UserTable.DiscordId.Type,
            userId: UserTable.UserId.Type,
            name: UserTable.Name.Type,
            avatar: UserTable.Avatar.Type,
        }).strict(),
        profileId: z.object({
            profileId: ProfileTable.ProfileId.Type,
            userId: UserTable.UserId.Type,
        }).strict(),
        void: z.object({}).strict()
    }
})

export namespace Profile {
    export async function fromSession(connection: DatabaseConnection, session: Glenna.Session): Promise<Nullable<Glenna.SessionUser>>{
        const data = await connection.maybeOne(sql.typeAlias("profileSummary")`
            select
                ${ProfileTable.ProfileId.Select()},
                ${UserTable.UserId.Select()},
                ${UserTable.DiscordId.Select()},
                ${UserTable.Name.Select()},
                ${UserTable.Avatar.Select()}
            from ${ProfileTable.Table}
                inner join ${ProfileTable.JoinUserToTable}
            where ${ProfileTable.MatchesId(session)}
        `)
        if(null == data)
            return null
        return {
            user: {
                userId: data.userId,
                name: data.name,
                discordId: data.discordId,
                avatar: data.avatar,
            }
        }
    }

    export async function getOrCreate(connection: DatabaseConnection, user: APIUser){
        return await connection.transaction(async transact => {
            const profile = await transact.maybeOne(sql.typeAlias("profileId")`
                select
                    ${ProfileTable.ProfileId.Select()},
                    ${ProfileTable.UserId.Select()}
                from ${ProfileTable.Table}
                    inner join ${ProfileTable.JoinUserToTable}
                where ${UserTable.MatchesDiscordId(user)}
            `)
            if(profile){
                await transact.query(sql.typeAlias("void")`
                    update ${UserTable.Table} set ${UserTable.UpdateFragment({
                        name: user.username,
                        avatar: user.avatar ?? null,
                    })}
                    where ${UserTable.MatchesId(profile)}
                `)

                return {
                    profileId: profile.profileId,
                    userId: profile.userId,
                    name: user.username,
                    avatar: user.avatar
                }
            } else {
                const query = sql.typeAlias("profileSummary")`
                with new_user as (
                    insert into ${UserTable.Table} (
                        ${UserTable.DiscordId.Insert()},
                        ${UserTable.Name.Insert()},
                        ${UserTable.Avatar.Insert()}
                    ) values (
                        ${user.id},
                        ${user.username},
                        ${user.avatar}
                    ) on conflict (${UserTable.DiscordId.Insert()}) do update set
                        (${UserTable.Name.Insert()}, ${UserTable.Avatar.Insert()}) =
                        (${UserTable.Name.Excluded()}, ${UserTable.Avatar.Excluded()})
                    returning
                        ${UserTable.DiscordId.Returning(null)},
                        ${UserTable.UserId.Returning(null)},
                        ${UserTable.Name.Returning(null)},
                        ${UserTable.Avatar.Returning(null)}
                ), new_profile as (
                    insert into ${ProfileTable.Table} (${ProfileTable.UserId.Insert()})
                    select ${UserTable.UserId.Returning(null)} from new_user
                    returning
                        ${ProfileTable.ProfileId.Returning(null)},
                        ${ProfileTable.UserId.Returning(null)}
                ), new_role as (
                    insert into app.playerrole (profile_id)
                    select profile_id from new_profile
                    returning player_role_id
                )
                select
                    profile_id as "profileId",
                    user_id as "userId",
                    discord_id as "discord_id",
                    name,
                    avatar
                from new_profile inner join new_user using(user_id)
            `
                console.log(query)
                const profile = await transact.one(query)

                return {
                    profileId: profile.profileId,
                    userId: profile.userId,
                    name: profile.name,
                    avatar: profile.avatar
                }
            }
        })
    }
}
