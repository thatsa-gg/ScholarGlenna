import type { APIGuild } from "discord-api-types/v10"
import { TempGuild } from "../schema/table-tempguild"
import { Sql } from "../lib/sql"
import { Guild } from "../schema/table-guild"

export namespace TempGuilds {
    export function MatchesAnyDiscord(guilds: Pick<APIGuild, 'id'>[]){
        return TempGuild.DiscordId.Condition("=",
            Sql.Array.BigInt(guilds.map(guild => BigInt(guild.id))))
    }

    export function JoinsGuildTable(){
        return TempGuild.GuildId.Condition("=", Guild.GuildId)
    }
}
