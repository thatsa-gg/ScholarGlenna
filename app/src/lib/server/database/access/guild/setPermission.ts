import { Guilds } from "../../helpers/guilds"
import type { ColumnsFromTable, InputPermissionMap } from "../../lib/table"
import { Guild } from "../../schema/table-guild"

type PermissionMap = Partial<InputPermissionMap<ColumnsFromTable<typeof Guild>>>
export async function setPermission(
    connection: DatabaseConnection,
    guild: Glenna.Id.Guild,
    permissions: PermissionMap
){
    return connection.query(Guild.Update(permissions, Guilds.Matches(guild)))
}
