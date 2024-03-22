import type { APIUser } from "discord-api-types/v10"
import { User } from "../schema/table-user"
import { Sql } from "../lib/sql"
import { GuildMember } from "../schema/table-guildmember"
import { Profile } from "../schema/table-profile"
import type { DatabaseTransactionConnection } from "slonik"

export namespace Users {
    export function MatchesDiscordUser(user: Pick<APIUser, "id">){
        return User.DiscordId.Condition("=", user.id)
    }

    export function Matches(user: Glenna.Id.User){
        return User.UserId.Condition("=", user.userId)
    }

    export async function FindByName(connection: DatabaseConnection, name: string){
        return await connection.maybeOne(Sql.Select({
            userId: User.UserId,
            discordId: User.DiscordId,
            name: User.Name,
            avatar: User.Avatar,
        }, User, User.Name.Condition("=", name)))
    }

    export async function Prune(connection: DatabaseConnection){
        await connection.query(Sql.Delete(User, Sql.NotExists(
            User.LeftOuterJoin("UserId", GuildMember.UserId)
                .LeftOuterJoin(Profile, Profile.UserId.Condition("=", User.UserId)),
            Sql.Or(
                GuildMember.GuildMemberId.Condition("is not null"),
                Profile.ProfileId.Condition("is not null")
            )
        )))
    }

    export async function CreateOrUpdate(connection: DatabaseTransactionConnection, user: APIUser){
        return await connection.one(Sql.UpsertReturning(User, {
            values: {
                DiscordId: user.id,
                Name: user.username,
                Avatar: user.avatar,
            },
            conflicting: [ "DiscordId" ],
            returning: {
                UserId: User.UserId
            }
        }))
    }
}
