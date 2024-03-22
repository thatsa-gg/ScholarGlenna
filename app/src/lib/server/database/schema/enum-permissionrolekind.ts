import { AppSchema } from "./schema-app"

export enum PermissionRoleKind {
    Public = "public",
    Administrator = "administrator",
    AnyGuildMember = "any_guild_member",
    AnyTeamMember = "any_team_member",
    AnyTeamOfficer = "any_team_officer",
    AnyTeamOwner = "any_team_owner",
    TeamMember = "team_member",
    TeamOfficer = "team_officer",
    TeamOwner = "team_owner",
    ManagementMember = "management_member",
    ManagementOfficer = "management_officer",
    ManagementOwner = "management_owner",
}

export const PermissionRoleKinds = AppSchema.Enum("permissionrolekind", PermissionRoleKind)
