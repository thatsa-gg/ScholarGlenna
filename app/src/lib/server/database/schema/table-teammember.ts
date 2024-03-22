import { Columns } from "../lib/columns"
import { TeamMemberKind, TeamMemberKinds } from "./enum-teammemberkind"
import { AppSchema } from "./schema-app"

export const TeamMember = AppSchema.Table("teammember", {
    TeamMemberId: Columns.PrimaryKey("team_member_id"),
    UserId: Columns.Integer("user_id"),
    Kind: TeamMemberKinds.Column("kind").Default(TeamMemberKind.Member),
})
