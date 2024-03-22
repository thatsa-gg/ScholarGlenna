import { Columns } from "../lib/columns"
import { PermissionRoleKinds } from "./enum-permissionrolekind"
import { AppSchema } from "./schema-app"

export const PermissionRole = AppSchema.Table("permissionrole", {
    PermissionRoleId: Columns.PrimaryKey("permission_role_id"),
    Kind: PermissionRoleKinds.Column("kind"),
    GuildId: Columns.Integer("guild_id").Nullable(),
    TeamId: Columns.Integer("team_id").Nullable(),
})
