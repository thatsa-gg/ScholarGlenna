import { createSqlTag, type DatabaseTransactionConnection } from "slonik"
import { z } from "zod"
import { RoleTable, RoleMemberTable } from "./tables"
import { RoleKind, RoleKinds } from "./types"
import { Database } from "./raw"
import type { APIGuildMemberWithUser } from "../discord"

const sql = createSqlTag({
    typeAliases: {
        role: z.object({
            roleId: RoleTable.RoleId.Type,
            kind: RoleTable.Kind.Type,
            guildId: RoleTable.GuildId.Type,
            teamId: RoleTable.TeamId.Type,
        }).strict(),
        roleMember: z.object({
            roleId: RoleMemberTable.RoleId.Type,
            userId: RoleMemberTable.UserId.Type,
            teamMemberId: RoleMemberTable.TeamMemberId.Type,
        }).strict(),
        guildRoles: z.object({
            anyGuildMember: RoleTable.RoleId.Type,
            anyTeamMember: RoleTable.RoleId.Type,
            anyTeamOfficer: RoleTable.RoleId.Type,
            anyTeamOwner: RoleTable.RoleId.Type,
            managementMember: RoleTable.RoleId.Type,
            managementOfficer: RoleTable.RoleId.Type,
            managementOwner: RoleTable.RoleId.Type,
            teamMember: RoleTable.RoleId.Type,
            teamOfficer: RoleTable.RoleId.Type,
            teamOwner: RoleTable.RoleId.Type,
        }).strict(),
        void: z.object({}).strict(),
    }
})

export namespace Role {
    export async function common(connection: DatabaseConnection){
        return await connection.many(sql.typeAlias("role")`
            select
                permission_role_id as "roleId",
                kind,
                guild_id as "guildId",
                team_id as "teamId"
            from app.permissionrole
            where kind = 'public' or kind = 'administrator'
            order by kind;
        `)
    }

    /**
     * Synchronize users with guilds' "member_role".
     *
     * Guild ownership and other roles are handled on the guild side, we just
     * sync membership here so users can immediately view guilds they're in.
     * @param connection Database connection
     * @param profile Profile ID of the user to synchronize
     * @param guilds Partial guild objects from the Discord API
     */
    export async function synchronizeGuildMemberRolesForProfile(
        connection: DatabaseConnection,
        profile: Glenna.Id.Profile,
        guilds: Glenna.Id.Guild[]
    ){
        const guildIds = Database.anyNumberArray(guilds.map(guild => guild.guildId))
        await connection.query(sql.typeAlias("void")`
            insert into app.permissionrolemember(permission_role_id, user_id)
            select
                app.permissionrole.permission_role_id,
                app.profile.user_id
            from app.guild
                inner join app.permissionrole using(guild_id)
                cross join app.profile
            where app.profile.profile_id = ${profile.profileId}
              and app.permissionrole.kind = 'any_guild_member'
              and app.guild.guild_id = ${guildIds}
            on conflict do nothing
        `)
        await connection.query(sql.typeAlias("void")`
            delete from app.permissionrolemember
                using app.profile, app.permissionrole, app.guild
            where app.permissionrole.kind = 'any_guild_member'
              and app.permissionrolemember.user_id = app.profile.user_id
              and app.profile.profile_id = ${profile.profileId}
              and app.permissionrolemember.permission_role_id = app.permissionrole.permission_role_id
              and app.permissionrole.guild_id = app.guild.guild_id
              and not (app.guild.guild_id = ${guildIds})
        `)
    }

    export async function addMissingGuildMemberRolesForNewGuild(
        connection: DatabaseConnection,
        guild: Glenna.Id.Guild,
        members: APIGuildMemberWithUser[]
    ){
        //  where guild_id = guild.guildId AND user.discord_id = ANY(members|>id::bigint[])
        //  1. create a guild member (it does not exist, the guild is new)
        //     member data is per-guild, so we don't need to filter guild
        //     just join to app.profile to limit to users with profiles (don't store more data than necessary)
        //     - owner is already in the table, do nothing on conflict!!!
        //  2. create a permission link
        await connection.query(sql.typeAlias("void")`
            with member_data as (
                select discord_id, nickname, avatar from ${sql.unnest(
                    members.map(member => [
                        member.user.id,
                        member.nick ?? null,
                        member.avatar ?? null
                    ] as const),
                    [
                        sql.fragment`bigint[]`,
                        sql.fragment`text[]`,
                        sql.fragment`text[]`
                    ]
                )} as t(discord_id, nickname, avatar)
            ), new_members as (
                insert into discord.guildmember(guild_id, user_id, nickname, avatar)
                select
                    ${guild.guildId} as guild_id,
                    app.profile.user_id,
                    member_data.nickname,
                    member_data.avatar
                from member_data
                    inner join discord.user using(discord_id)
                    inner join app.profile using(user_id)
                on conflict (guild_id, user_id) do nothing
                returning guild_id, user_id
            )
            insert into app.permissionrolemember(permission_role_id, user_id)
            select
                app.permissionrole.permission_role_id,
                new_members.user_id
            from new_members
                inner join app.permissionrole using(guild_id)
            where
                app.permissionrole.kind = ${RoleKinds.AnyGuildMember}
        `)
    }

    export async function createGuildRoles(
        connection: DatabaseTransactionConnection,
        guild: Glenna.Id.Guild,
        managementTeam: Glenna.Id.Team,
    ){
        const roles = await connection.one(sql.typeAlias("guildRoles")`
            with role_batch as (
                insert into app.permissionrole (kind, guild_id, team_id) values
                    (${RoleKinds.AnyGuildMember}, ${guild.guildId}, NULL),
                    (${RoleKinds.AnyTeamMember}, ${guild.guildId}, NULL),
                    (${RoleKinds.AnyTeamOfficer}, ${guild.guildId}, NULL),
                    (${RoleKinds.AnyTeamOwner}, ${guild.guildId}, NULL),
                    (${RoleKinds.ManagementMember}, ${guild.guildId}, NULL),
                    (${RoleKinds.ManagementOfficer}, ${guild.guildId}, NULL),
                    (${RoleKinds.ManagementOwner}, ${guild.guildId}, NULL),
                    (${RoleKinds.TeamMember}, ${guild.guildId}, ${managementTeam.teamId}),
                    (${RoleKinds.TeamOfficer}, ${guild.guildId}, ${managementTeam.teamId}),
                    (${RoleKinds.TeamOwner}, ${guild.guildId}, ${managementTeam.teamId})
                returning *
            )
            select
                agm.permission_role_id as "anyGuildMember",
                atm.permission_role_id as "anyTeamMember",
                ato.permission_role_id as "anyTeamOfficer",
                atc.permission_role_id as "anyTeamOwner",
                mm.permission_role_id as "managementMember",
                mo.permission_role_id as "managementOfficer",
                mc.permission_role_id as "managementOwner",
                tm.permission_role_id as "teamMember",
                tof.permission_role_id as "teamOfficer",
                tc.permission_role_id as "teamOwner"
            from role_batch agm
                left outer join role_batch atm on atm.kind = ${RoleKinds.AnyTeamMember}
                left outer join role_batch ato on ato.kind = ${RoleKinds.AnyTeamOfficer}
                left outer join role_batch atc on atc.kind = ${RoleKinds.AnyTeamOwner}
                left outer join role_batch mm on mm.kind = ${RoleKinds.ManagementMember}
                left outer join role_batch mo on mo.kind = ${RoleKinds.ManagementOfficer}
                left outer join role_batch mc on mc.kind = ${RoleKinds.ManagementOwner}
                left outer join role_batch tm on tm.kind = ${RoleKinds.TeamMember}
                left outer join role_batch tof on tof.kind = ${RoleKinds.TeamOfficer}
                left outer join role_batch tc on tc.kind = ${RoleKinds.TeamOwner}
            where agm.kind = ${RoleKinds.AnyGuildMember}
        `)
        await connection.query(sql.typeAlias("void")`
            insert into app.permissionrolerolemember (parent_permission_role_id, child_permission_role_id)
            values
                (${roles.anyGuildMember}, ${roles.anyTeamMember}),
                (${roles.anyGuildMember}, ${roles.managementMember}),

                (${roles.managementMember}, ${roles.managementOfficer}),
                (${roles.managementOfficer}, ${roles.managementOwner}),

                (${roles.anyTeamMember}, ${roles.anyTeamOfficer}),
                (${roles.anyTeamOfficer}, ${roles.anyTeamOwner}),

                (${roles.teamMember}, ${roles.teamOfficer}),
                (${roles.teamOfficer}, ${roles.teamOwner}),

                (${roles.managementMember}, ${roles.teamMember}),
                (${roles.managementOfficer}, ${roles.teamOfficer}),
                (${roles.managementOwner}, ${roles.teamOwner})
        `)
        await connection.query(sql.typeAlias("void")`
            insert into app.permissionrolerolemember (parent_permission_role_id, child_permission_role_id)
            select
                permission_role_id as parent_permission_role_id,
                ${roles.anyGuildMember} as child_permission_role_id
            from app.permissionrole where kind = 'public'
            union all
            select
                ${roles.managementOwner} as parent_permission_role_id,
                permission_role_id as child_permission_role_id
            from app.permissionrole where kind = 'administrator'
        `)

        return roles
    }

    export async function getTeamRole(
        connection: DatabaseTransactionConnection,
        team: { teamId: number },
        kind: RoleKind.TeamMember | RoleKind.TeamOfficer | RoleKind.TeamOwner
    ){
        return await connection.one(sql.typeAlias("role")`
            select
                permission_role_id as "roleId",
                kind,
                guild_id as "guildId",
                team_id as "teamId"
            from app.permissionrole
            where team_id = ${team.teamId} and kind = ${kind}
        `)
    }

    export async function getDirectUsers(
        connection: DatabaseConnection,
        role: { roleId: number }
    ){
        return await connection.any(sql.typeAlias("roleMember")`
            select
                permission_role_id as "roleId",
                user_id as "userId",
                team_member_id as "teamMemberId"
            from app.permissionrolemember
            where permission_role_id = ${role.roleId}
        `)
    }
}
