import { Columns } from "../lib/columns"
import { AppSchema } from "./schema-app"
import { PermissionRole } from "./table-permissionrole"

export const PermissionRoleRoleMember = AppSchema.Table("permissionrole", {
    PermissionRoleMemberId: Columns.PrimaryKey("permission_role_role_member_id"),
    ParentPermissionRoleId: Columns.Integer("parent_permission_role_id").References(() => PermissionRole.PermissionRoleId),
    ChildPermissionRoleId: Columns.Integer("child_permission_role_id").References(() => PermissionRole.PermissionRoleId),
})
