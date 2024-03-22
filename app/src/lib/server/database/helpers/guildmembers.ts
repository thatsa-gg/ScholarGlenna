import { Sql } from "../lib/sql";
import { GuildMember } from "../schema/table-guildmember";

export namespace GuildMembers {
    export function SelectIsMember(alias: string = "isMember"){
        return Sql.As(
            GuildMember.GuildMemberId.Condition("is not null"),
            alias
        )
    }
}
