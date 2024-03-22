import { Columns } from "../lib/columns"
import { ServerRegions } from "./enum-serverregion"
import { TeamFocuses } from "./enum-teamfocus"
import { TeamKind, TeamKinds } from "./enum-teamkind"
import { TeamLevels } from "./enum-teamlevel"
import { AppSchema } from "./schema-app"

export const Team = AppSchema.Table("team", {
    TeamId: Columns.PrimaryKey("team_id"),
    GuildId: Columns.Integer("guild_id"),
    SyncedRole: Columns.DiscordId("discord_role_id").Optional(),
    LeagueId: Columns.Integer("league_id").Optional(),

    Name: Columns.VarChar(64, "name"),
    Kind: TeamKinds.Column("kind").Default(TeamKind.Squad),
    Focus: TeamFocuses.Column("focus").Optional(),
    Level: TeamLevels.Column("level").Optional(),
    Region: ServerRegions.Column("region").Optional(),

    ApplicationsOpen: Columns.Boolean("applications_open").Optional(),

    Color: Columns.Integer("color").Optional(),
    Icon: Columns.Text("icon").Optional(),
})
