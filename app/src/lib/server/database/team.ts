import type { APIGuild, APIRole } from "discord-api-types/v10"
import { createSqlTag, type DatabaseTransactionConnection } from "slonik"
import { z } from "zod"
import { ColumnSet, TeamMemberTable, type PickColumns, TeamInfoView, TeamReadView } from "./tables"
import { TeamKind } from "./types"

const common = new ColumnSet({
    ...TeamTable.TeamId.Set,
    ...TeamTable.DiscordRoleId.Rename("syncedRole").Set,
    ...TeamTable.Kind.Set,
    ...TeamTable.Name.Set,
    ...TeamTable.Focus.Set,
    ...TeamTable.Level.Set,
    ...TeamInfoView.LeagueName.Set,
})

const sql = createSqlTag({
    typeAliases: {
        teamId: z.object({
            teamId: TeamTable.TeamId.OutputType
        }).strict(),
        team: common.Type.strict(),
        visibleTeam: common.Type.extend({
            isMember: z.boolean()
        }).strict(),
        void: z.object({}).strict()
    }
})

import { Team as TeamTable } from "./schema/table-team"
import { Sql } from "./lib/sql"
import { Teams } from "./helpers"
export namespace Team2 {
    export async function setColorAndIcon(connection: DatabaseConnection, team: { teamId: number }, role: Pick<APIRole, 'color' | 'icon'>){
        await connection.query(TeamTable.Update({
            Color: role?.color ?? null, // TODO: format for web
            Icon: role?.icon ?? null,
        }, Teams.Matches(team)))
    }

    export async function create(
        connection: DatabaseTransactionConnection,
        guild: Glenna.Id.Guild,
        properties: {
            name: string,
            kind?: TeamKind,
        }
    ){
        TeamTable.TeamId.Condition("=", 0)
        return await connection.one(TeamTable.Insert({
            GuildId: guild.guildId,
            Name: properties.name,
            Kind: properties.kind ?? TeamKind.Squad,
        }, {
            teamId: "TeamId"
        }))
    }

    export async function setPermissions(
        connection: DatabaseTransactionConnection,
        team: Glenna.Id.Team,
        permissions: PickColumns<typeof TeamTable["Permissions"], "read">
    ){
        const set = TeamTable.Permissions.Update(permissions)
        if(null !== set)
            return
        await connection.query(sql.typeAlias("void")`
            update ${TeamTable.Table} set ${set}
            where ${TeamTable.MatchId(team)}
        `)
    }

    export async function getVisible(
        connection: DatabaseConnection,
        user: Nullable<Glenna.Id.User>,
        guild: Glenna.Id.Guild,
    ){
        const team = await connection.many(Sql.SelectDistinct({
            teamId: TeamTable.TeamId,
            syncedRole: TeamTable.SyncedRole,
            kind: TeamTable.Kind,
            name: TeamTable.Name,
            focus: TeamTable.Focus,
            level: TeamTable.Level,
            leaugeName: null!,
        },
            TeamTable.InnerJoin("TeamId", TeamReadView.TeamId)))
        const teams = await connection.any(sql.typeAlias("visibleTeam")`
            select distinct
                ${common.Select()},
                ${TeamMemberTable.SelectIsMember()}
            from ${TeamTable.Table}
                inner join ${TeamReadView.JoinViewToBaseTable}
                inner join ${TeamInfoView.JoinViewToTeam}
                left outer join ${TeamMemberTable.JoinTableToReadView(user)}
            where
                ${TeamTable.MatchesGuild(guild)}
                and ${TeamReadView.HasPermission(user)}
        `)
        return teams
    }
}
