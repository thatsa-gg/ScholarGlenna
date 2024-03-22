import type { APIGuild, RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10"
import { Sql } from "./lib/sql"
import { Guild, TempGuild } from "./schema"
import { Guilds, TempGuilds } from "./helpers"

export namespace App {
    export async function prepareSynchronize(connection: DatabaseConnection){
        await connection.query(Sql.Truncate(TempGuild))
        await connection.query(Sql.Void`
            ${TempGuild.InsertFragment("GuildId", "DiscordId")}
            select
            ${Sql.Columns({
                GuildId: Guild.GuildId,
                DiscordId: Guild.DiscordId,
            })}
            from ${Guild.GetSql()}
        `)
    }

    export async function markActiveGuild(connection: DatabaseConnection, guilds: (APIGuild | RESTAPIPartialCurrentUserGuild)[]){
        await connection.query(Sql.Void`
            ${TempGuild.DeleteFragment()}
            where
                ${TempGuilds.MatchesAnyDiscord(guilds)}
        `)
    }

    export async function markInactiveGuilds(connection: DatabaseConnection){
        await connection.query(Sql.Void`
            ${Guild.UpdateValuesFragment({
                LastSeen: Sql.Now,
            })}
            where not ${TempGuild.Exists(TempGuilds.JoinsGuildTable())}
        `)
    }

    export async function cleanupOldGuilds(connection: DatabaseConnection){
        await connection.query(Sql.Void`
            ${Guild.DeleteFragment()}
            where
                ${Guilds.NotRecentlySeen()}
        `)
    }
}
