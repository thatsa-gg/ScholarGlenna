import type { APIGuild, APIRole } from "discord-api-types/v10"
import { Sql } from "../lib/sql"
import { TeamKind } from "../schema/enum-teamkind"
import { Team } from "../schema/table-team"
import { Guild } from "../schema/table-guild"
import { Guilds } from "./guilds"

export namespace Teams {
    export function Matches(team: Glenna.Id.Team){
        return Team.TeamId.Condition("=", team.teamId)
    }

    export function IsManagementFor(guild: Glenna.Id.Guild){
        return Sql.And(
            Team.GuildId.Condition("=", guild.guildId),
            Team.Kind.Condition("=", TeamKind.Management)
        )
    }

    export async function GetAllByDiscordGuild(connection: DatabaseConnection, guild: Pick<APIGuild, "id">){
        return await connection.many(Sql.Select({
            TeamId: Team.TeamId,
            SyncedRole: Team.SyncedRole
        },
            Team.InnerJoin("GuildId", Guild.GuildId),
            Guilds.MatchesGuild(guild)))
    }

    export async function SetRole(connection: DatabaseConnection, team: Glenna.Id.Team, role: Nullable<APIRole>){
        await connection.query(Team.Update({
            SyncedRole: role?.id ?? null,
        }, Teams.Matches(team)))
    }
}
