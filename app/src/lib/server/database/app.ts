import type { APIGuild, RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10"
import { createSqlTag } from "slonik"
import { z } from "zod"
import { Database } from "./raw"
import { GuildTable, TempGuildTable } from "./tables"

const sql = createSqlTag({
    typeAliases: {
        void: z.object({}).strict()
    }
})

export namespace App {
    export async function prepareSynchronize(connection: DatabaseConnection){
        connection.query(sql.typeAlias("void")`
            truncate ${TempGuildTable.Table};
            insert into ${TempGuildTable.Table} (
                ${TempGuildTable.GuildId.Insert()},
                ${TempGuildTable.DiscordId.Insert()}
            )
            select
                ${GuildTable.GuildId.Column},
                ${GuildTable.DiscordId.Column}
            from ${GuildTable.Table}
        `)
    }

    export async function markActiveGuild(connection: DatabaseConnection, guilds: (APIGuild | RESTAPIPartialCurrentUserGuild)[]){
        connection.query(sql.typeAlias("void")`
            delete from ${TempGuildTable.Table}
            where ${TempGuildTable.MatchesAnyDiscordId(guilds)}
        `)
    }

    export async function markInactiveGuilds(connection: DatabaseConnection){
        connection.query(sql.typeAlias("void")`
            update ${GuildTable.Table} set ${GuildTable.All.Update({
                lastSeen: Database.Now
            })}
            where not exists (select 1
                              from ${TempGuildTable.Table}
                              where ${TempGuildTable.DiscordId.Column} = ${GuildTable.DiscordId.Column})
        `)
    }

    export async function cleanupOldGuilds(connection: DatabaseConnection){
        connection.query(sql.typeAlias("void")`
            delete from ${GuildTable.Table}
            where ${GuildTable.NotRecentlySeen()}
        `)
    }
}
