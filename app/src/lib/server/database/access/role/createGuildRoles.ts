import { Sql } from "../../lib/sql"
import { sql } from "slonik"
import { z } from "zod"
import { PermissionRole } from "../../schema/table-permissionrole"
import { RoleKind } from "../../types"
import { PermissionRoleRoleMember } from "../../schema/table-permissionrolerolemember"
import { PermissionRoleKind } from "../../schema/enum-permissionrolekind"
import { PermissionRoles } from "../../helpers/permissionroles"

const guildRoles = z.object({
    anyGuildMember: PermissionRole.PermissionRoleId.OutputType,
    anyTeamMember: PermissionRole.PermissionRoleId.OutputType,
    anyTeamOfficer: PermissionRole.PermissionRoleId.OutputType,
    anyTeamOwner: PermissionRole.PermissionRoleId.OutputType,
    managementMember: PermissionRole.PermissionRoleId.OutputType,
    managementOfficer: PermissionRole.PermissionRoleId.OutputType,
    managementOwner: PermissionRole.PermissionRoleId.OutputType,
    teamMember: PermissionRole.PermissionRoleId.OutputType,
    teamOfficer: PermissionRole.PermissionRoleId.OutputType,
    teamOwner: PermissionRole.PermissionRoleId.OutputType,
}).strict()

export async function createGuildRoles(
    connection: DatabaseConnection,
    guild: Glenna.Id.Guild,
    managementTeam: Glenna.Id.Team,
){
    // generate all the new roles and return them as a batch row
    const roles = await connection.one(sql.type(guildRoles)`
    with role_batch as (
        ${PermissionRole.InsertFragment("Kind", "GuildId", "TeamId")}
        values
            (${RoleKind.AnyGuildMember}, ${guild.guildId}, NULL),
            (${RoleKind.AnyTeamMember}, ${guild.guildId}, NULL),
            (${RoleKind.AnyTeamOfficer}, ${guild.guildId}, NULL),
            (${RoleKind.AnyTeamOwner}, ${guild.guildId}, NULL),
            (${RoleKind.ManagementMember}, ${guild.guildId}, NULL),
            (${RoleKind.ManagementOfficer}, ${guild.guildId}, NULL),
            (${RoleKind.ManagementOwner}, ${guild.guildId}, NULL),
            (${RoleKind.TeamMember}, ${guild.guildId}, ${managementTeam.teamId}),
            (${RoleKind.TeamOfficer}, ${guild.guildId}, ${managementTeam.teamId}),
            (${RoleKind.TeamOwner}, ${guild.guildId}, ${managementTeam.teamId})
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
        left outer join role_batch atm on atm.kind = ${RoleKind.AnyTeamMember}
        left outer join role_batch ato on ato.kind = ${RoleKind.AnyTeamOfficer}
        left outer join role_batch atc on atc.kind = ${RoleKind.AnyTeamOwner}
        left outer join role_batch mm on mm.kind = ${RoleKind.ManagementMember}
        left outer join role_batch mo on mo.kind = ${RoleKind.ManagementOfficer}
        left outer join role_batch mc on mc.kind = ${RoleKind.ManagementOwner}
        left outer join role_batch tm on tm.kind = ${RoleKind.TeamMember}
        left outer join role_batch tof on tof.kind = ${RoleKind.TeamOfficer}
        left outer join role_batch tc on tc.kind = ${RoleKind.TeamOwner}
    where agm.kind = ${RoleKind.AnyGuildMember}
    `)

    // then link them together
    await connection.query(Sql.Void`
    ${PermissionRoleRoleMember.InsertFragment("ParentPermissionRoleId", "ChildPermissionRoleId")}
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

    // add anyGuildMember to the public role
    // and administrator role to managementOwner
    await connection.query(Sql.Void`
    ${PermissionRoleRoleMember.InsertFragment("ParentPermissionRoleId", "ChildPermissionRoleId")}
    select
        ${PermissionRole.PermissionRoleId.AsSql()} as parent_permission_role_id,
        ${roles.anyGuildMember} as child_permission_role_id
    from ${PermissionRole.AsSql()}
        where ${PermissionRoles.MatchesKind(PermissionRoleKind.Public)}
    union all
    select
        ${roles.managementOwner} as parent_permission_role_id,
        ${PermissionRole.PermissionRoleId.AsSql()} as child_permission_role_id
    from ${PermissionRole.AsSql()}
        where ${PermissionRoles.MatchesKind(PermissionRoleKind.Administrator)}
    `)

    return roles
}
