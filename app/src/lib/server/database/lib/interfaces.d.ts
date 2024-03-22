import type { IdentifierSqlToken, SqlFragment } from "slonik"

export interface Selectable {
    GetSql(): SqlFragment | IdentifierSqlToken
}

export interface Deletable {
    DeleteFragment(): SqlFragment
}
