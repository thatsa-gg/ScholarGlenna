import { Columns } from "../lib/columns"
import { PermissionRoleKinds } from "./enum-permissionrolekind"
import { AppSchema } from "./schema-app"

// TODO: make this a view not a tabled
export const TeamReadView = AppSchema.Table("team_readview", {
    TeamId: Columns.Integer("team_id"),
    UserId: Columns.Integer("user_id"),
    Kind: PermissionRoleKinds.Column("kind"),
})
