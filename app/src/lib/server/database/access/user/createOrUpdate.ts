import type { APIUser } from "discord-api-types/v10"
import { User } from "../../schema"
import { Sql } from "../../lib/sql"

export async function createOrUpdate(
    connection: DatabaseConnection,
    user: APIUser
){
    return Sql.UpsertReturning(User, {
        values: {
            DiscordId: user.id,
            Name: user.username,
            Avatar: user.avatar
        },
        conflicting: [ "DiscordId" ],
        returning: {
            userId: "UserId"
        }
    })
}
