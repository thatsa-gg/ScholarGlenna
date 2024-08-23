import { TeamKind } from "../../types"
import { Team as TeamTable } from "../../schema/table-team"

export async function create(
    connection: DatabaseConnection,
    guild: Glenna.Id.Guild,
    properties: {
        name: string,
        kind?: TeamKind
    }
){
    return await(connection.one(TeamTable.Insert({
        GuildId: guild.guildId,
        Name: properties.name,
        Kind: properties.kind ?? TeamKind.Squad,
    }, {
        teamId: "TeamId"
    })))
}
