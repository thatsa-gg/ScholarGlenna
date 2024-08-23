import type { APIGuild, RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10"
import { Sql } from "../lib/sql"
import { TempGuild } from "../schema/table-tempguild"
import { TempGuilds } from "../helpers/tempguilds"
import { Guild } from "../schema/table-guild"
import { Guilds } from "../helpers/guilds"

/**
 * Used in /api/synchronize
 */
export namespace Synchronize {
    export async function Prepare(connection: DatabaseConnection){
        await connection.query(Sql.Truncate(TempGuild))
        await connection.query(Sql.Void`
            ${TempGuild.InsertFragment("GuildId", "DiscordId")}
            select
            ${Sql.Columns({
                GuildId: Guild.GuildId,
                DiscordId: Guild.DiscordId
            })}
            from ${Guild.AsSql()}
        `)
    }

    type ImportGuild = APIGuild | RESTAPIPartialCurrentUserGuild
    export async function MarkGuildsActive(connection: DatabaseConnection, guilds: ImportGuild[]){
        await connection.query(Sql.Void`
            ${TempGuild.DeleteFragment()}
            where
                ${TempGuilds.MatchesAnyDiscord(guilds)}
        `)
    }

    export async function MarkInactiveGuilds(connection: DatabaseConnection){
        await connection.query(Sql.Void`
            ${Guild.UpdateValuesFragment({
                LastSeen: Sql.Now,
            })}
            where not ${TempGuild.Exists(TempGuilds.JoinsGuildTable())}
        `)
    }

    export async function PruneOldGuilds(connection: DatabaseConnection){
        await connection.query(Sql.Void`
            ${Guild.DeleteFragment()}
            where
                ${Guilds.NotRecentlySeen()}
        `)
    }
}
