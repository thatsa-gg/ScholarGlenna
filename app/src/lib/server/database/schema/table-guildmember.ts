import { Columns } from "../lib/columns"
import { DiscordSchema } from "./schema-discord"

export const GuildMember = DiscordSchema.Table("guildmember", {
    GuildMemberId: Columns.PrimaryKey("guild_member_id"),
    GuildId: Columns.Integer("guild_id"),
    UserId: Columns.Integer("user_id"),
})
