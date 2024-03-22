import { AppSchema } from "./schema-app"

export enum TeamMemberKind {
    Member = "member",
    Manager = "manager",
    Representative = "manager",
    Owner = "owner",
}

export const TeamMemberKinds = AppSchema.Enum("teammmemberkind", TeamMemberKind)
