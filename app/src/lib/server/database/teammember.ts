import type { APIGuildMemberWithUser } from "../discord"
import { createSqlTag, type DatabaseTransactionConnection } from "slonik"
import { z } from "zod"
import { UserTable, TeamMemberTable } from "./tables"
import type { RoleKind } from "./types"

const sql = createSqlTag({
    typeAliases: {
        void: z.object({}).strict(),
        teamMemberId: z.object({
            teamMemberId: TeamMemberTable.TeamMemberId.Type,
        }).strict(),
        teamMember: z.object({
            teamMemberId: TeamMemberTable.TeamMemberId.Type,
            discordId: UserTable.DiscordId.Type
        }).strict()
    }
})

export namespace TeamMember {
    export async function removeAll(connection: DatabaseConnection, team: { teamId: number }){
        await connection.query(sql.typeAlias("void")`
            delete from app.teammember
            where team_id = ${team.teamId}
        `)
    }

    export async function setFromList(connection: DatabaseConnection, team: { teamId: number }, members: APIGuildMemberWithUser[]){
        // TODO
        // prune removed users (remove guild member)
        // add new users (add/link guild member)
    }

    export async function getAllFromTeam(connection: DatabaseConnection, team: { teamId: number }){
        return await connection.many(sql.typeAlias("teamMember")`
            select
                app.teammember.team_member_id as "teamMemberId",
                discord.user.discord_id as "discordId"
            from app.teammember
                inner join discord.guildmember using(guild_member_id)
                inner join discord.user using(user_id)
            where team_id = ${team.teamId}
        `)
    }

    export async function remove(connection: DatabaseConnection, teamMember: { teamMemberId: number }){
        await connection.query(sql.typeAlias("void")`
            delete from app.teammember
            where team_member_id = ${teamMember.teamMemberId}
        `)
    }

    export async function create(
        connection: DatabaseTransactionConnection,
        team: { teamId: number },
        member: { guildMemberId: number }
    ){
        return await connection.one(sql.typeAlias("teamMemberId")`
            insert into app.teammember(team_id, guild_member_id) values (
                ${team.teamId}, ${member.guildMemberId}
            ) returning team_member_id as "teamMemberId"
        `)
    }

    export async function setRole(
        connection: DatabaseTransactionConnection,
        member: { teamMemberId: number },
        role: RoleKind.TeamMember | RoleKind.TeamOfficer | RoleKind.TeamOwner
    ){
        // remove the user from any other team roles,
        // and then add them to the one they need
        // or do nothing if they already have it
        await connection.query(sql.typeAlias("void")`
            with removed as (
                delete from app.permissionrolemember
                    using app.permissionrole, app.teammember
                where app.permissionrolemember.team_member_id = app.teammember.team_member_id
                  and app.permissionrolemember.permission_role_id = app.permissionrole.permission_role_id
                  and app.teammember.team_member_id = ${member.teamMemberId}
                  and app.permissionrole.kind <> ${role}
                returning app.permissionrolemember.permission_role_member_id
            )
            insert into app.permissionrolemember(permission_role_id, user_id, team_member_id)
            select
                app.permissionrole.permission_role_id,
                discord.guildmember.user_id,
                app.teammember.team_member_id
            from app.permissionrole
                inner join app.teammember using(team_id)
                inner join discord.guildmember using(guild_member_id)
            where app.teammember.team_member_id = ${member.teamMemberId}
                and app.permissionrole.kind = ${role}
            on conflict do nothing
        `)
    }

    export async function removeByUserId(
        connection: DatabaseTransactionConnection,
        team: { teamId: number },
        user: { userId: number }
    ){
        // because role memberships for teams are created with team_member_id as
        // a foreign key, they will be deleted by cascade
        await connection.query(sql.typeAlias("void")`
            delete from app.teammember
            using discord.guildmember
            where app.teammember.guild_member_id = app.discord.guild_member_id and
              and app.teammember.team_id = ${team.teamId}
              and discord.guildmember.user_id = ${user.userId}
        `)
    }
}
