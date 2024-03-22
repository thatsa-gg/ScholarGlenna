import { Columns } from "../lib/columns"
import { AppSchema } from "./schema-app"
import { Database } from "../raw"
import { ServerRegions } from "./enum-serverregion"

export const Guild = AppSchema.Table("guild", {
    GuildId: Columns.PrimaryKey("guild_id"),
    DiscordId: Columns.DiscordId("discord_id").Unique(),
    Acronym: Columns.VarChar(8, "acronym"),
    Description: Columns.Text("description").Nullable(),
    ServerRegion: ServerRegions.Column("server_region").Nullable().Default(null),
    Name: Columns.VarChar(128, "name"),
    Icon: Columns.Text("icon").Nullable(),
    LastSeen: Columns.Timestamp("last_seen").Default(Database.Now),
    LookupAlias: Columns.VarChar(32, "lookup_alias"),
    VanityCode: Columns.VarChar(32, "vanity_code").Nullable(),
})
