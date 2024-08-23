import type { IdentifierSqlToken, SqlFragment } from "slonik"

export interface Selectable {
    AsSql(): SqlFragment | IdentifierSqlToken
}

export interface Deletable {
    DeleteFragment(): SqlFragment
}
