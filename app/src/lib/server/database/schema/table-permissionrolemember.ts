import { Columns } from "../lib/columns"
import { AppSchema } from "./schema-app"
import { PermissionRole } from "./table-permissionrole"
import { TeamMember } from "./table-teammember"
import { User } from "./table-user"

export const PermissionRoleMember = AppSchema.Table("permissionrole", {
    PermissionRoleMemberId: Columns.PrimaryKey("permission_role_member_id"),
    PermissionRoleId: Columns.Integer("permission_role_id").References(() => PermissionRole.PermissionRoleId),
    UserId: Columns.Integer("user_id").References(() => User.UserId),
    TeamMemberId: Columns.Integer("team_member_id")
        .References(() => TeamMember.TeamMemberId)
        .Nullable().Default(null)
})
