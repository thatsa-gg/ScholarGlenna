import { Teams } from "../../helpers/teams"
import type { ColumnsFromTable, InputPermissionMap } from "../../lib/table"
import { Team } from "../../schema/table-team"

type PermissionMap = Partial<InputPermissionMap<ColumnsFromTable<typeof Team>>>
export async function setPermission(
    connection: DatabaseConnection,
    team: Glenna.Id.Team,
    permissions: PermissionMap
){
    return connection.query(Team.Update(permissions, Teams.Matches(team)))
}
