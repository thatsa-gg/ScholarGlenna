import { Columns } from "../lib/columns"
import { TempSchema } from "./schema-temp"

export const TempGuild = TempSchema.Table("guild", {
    GuildId: Columns.PrimaryKey("guild_id"),
    DiscordId: Columns.DiscordId("discord_id").Unique(),
})
