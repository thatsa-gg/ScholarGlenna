import type { APIGuild, APIRole } from "discord-api-types/v10"
import { createSqlTag, type DatabaseTransactionConnection } from "slonik"
import { z } from "zod"
import { Column, ColumnSet, GuildTable, TeamMemberTable, TeamTable, type PickColumns, TeamInfoView, TeamReadView, LeagueTable } from "./tables"
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
            teamId: TeamTable.TeamId.Type
        }).strict(),
        team: common.Type.strict(),
        visibleTeam: common.Type.extend({
            isMember: z.boolean()
        }).strict(),
        void: z.object({}).strict()
    }
})

export namespace Team {
    export async function getAllByDiscordGuild(connnection: DatabaseConnection, guild: Pick<APIGuild, 'id'>){
        return await connnection.many(sql.typeAlias("team")`
            select
                ${TeamTable.TeamId.Select()},
                ${TeamTable.DiscordRoleId.Select("syncedRole")}
            from ${GuildTable.Table}
                inner join ${TeamTable.JoinTableToGuild}
            where ${GuildTable.MatchesDiscordId(guild)}
        `)
    }

    export async function setRole(connection: DatabaseConnection, team: { teamId: number }, role: Nullable<APIRole>){
        await connection.query(sql.typeAlias("void")`
            update ${TeamTable.Table} set ${
                TeamTable.All.Update({
                    discordRoleId: role?.id ?? null
                })
            } where ${TeamTable.MatchId(team)}
        `)
    }

    export async function setColorAndIcon(connection: DatabaseConnection, team: { teamId: number }, role: Pick<APIRole, 'color' | 'icon'>){
        await connection.query(sql.typeAlias("void")`
            update ${TeamTable.Table} set ${
                TeamTable.All.Update({
                    color: role.color ?? null, // TODO: format for web
                    icon: role.icon ?? null
                })
            }
            where ${TeamTable.MatchId(team)}
        `)
    }

    export async function create(
        connection: DatabaseTransactionConnection,
        guild: Glenna.Id.Guild,
        properties: {
            name: string,
            kind?: TeamKind,
        }
    ){
        return await connection.one(sql.typeAlias("teamId")`
            insert into ${TeamTable.InsertFragment("guildId", "name", "kind")}
            values (
                ${guild.guildId},
                ${properties.name},
                ${properties.kind ?? TeamKind.Squad}
            ) returning ${TeamTable.TeamId.Returning()}
        `)
    }

    export async function setPermissions(
        connection: DatabaseTransactionConnection,
        team: { teamId: number },
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

    export async function getManagementTeam(
        connection: DatabaseTransactionConnection,
        guild: Glenna.Id.Guild
    ){
        return await connection.one(sql.typeAlias("teamId")`
            select
                ${TeamTable.TeamId.Select()}
            from ${TeamTable.Table}
            where ${TeamTable.IsManagementFor(guild)}
        `)
    }

    export async function getVisible(
        connection: DatabaseConnection,
        user: Nullable<Glenna.Id.User>,
        guild: Glenna.Id.Guild,
    ){
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
