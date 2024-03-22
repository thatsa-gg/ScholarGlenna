import { AppSchema } from "./schema-app"

export enum TeamKind {
    Management = 'management',
    Squad = 'squad',
    Party = 'party',
    Loose = 'loose',
}

export const TeamKinds = AppSchema.Enum("teamkind", TeamKind)
