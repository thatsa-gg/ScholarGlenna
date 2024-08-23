import type { PermissionRoleKind } from "../schema/enum-permissionrolekind";
import { PermissionRole } from "../schema/table-permissionrole";

export namespace PermissionRoles {
    export function MatchesKind(kind: PermissionRoleKind){
        return PermissionRole.Kind.Condition("=", kind)
    }
}
