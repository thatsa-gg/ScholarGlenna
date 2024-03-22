import { DiscordSchema } from "./schema-discord"
import { Columns } from "../lib/columns"

export const User = DiscordSchema.Table("user", {
    UserId: Columns.PrimaryKey("user_id"),
    DiscordId: Columns.DiscordId("discord_id").Unique(),
    Name: Columns.VarChar(32, "name").Unique(),
    Avatar: Columns.Text("avatar").Nullable(),
})
