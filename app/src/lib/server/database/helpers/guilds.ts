import type { APIGuild } from "discord-api-types/v10"
import { Guild } from "../schema/table-guild"
import { Sql } from "../lib/sql"

export namespace Guilds {
    export function NotRecentlySeen(){
        return Guild.LastSeen.Condition("<", Sql.OffsetDate({ days: 7 }))
    }

    export function MatchesGuild(guild: Pick<APIGuild, "id">){
        return Guild.DiscordId.Condition("=", guild.id)
    }

    export function MatchesSlug(slug: string){
        return Sql.Or(
            Guild.VanityCode.Condition("=", slug),
            Guild.LookupAlias.Condition("=", slug)
        )
    }
}
