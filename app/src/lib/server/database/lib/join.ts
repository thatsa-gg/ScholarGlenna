import { sql, type IdentifierSqlToken, type SqlFragment } from "slonik"
import type { Table, TableColumns } from "./table"
import type { Selectable } from "./interfaces"
import type { Schema } from "./schema"

type JoinType = "inner" | "left" | "right" | "cross"
export class Join implements Selectable {
    BaseTable: Table
    Entries: Array<{ type: JoinType, to: Table, on: SqlFragment | null  }>
    constructor(from: Table, type: JoinType, to: Table, on: SqlFragment | null ){
        this.BaseTable = from
        this.Entries = [{ type, to, on }]
    }

    Add<TTable extends Table<Schema<string>>>(type: JoinType, to: TTable, on: SqlFragment | null){
        this.Entries.push({ type, to, on })
        return this
    }

    LeftOuterJoin<TCols extends TableColumns, TTable extends Table<Schema<string>, string, TCols>>(to: TTable, on: SqlFragment | null){
        return this.Add("left", to, on)
    }

    GetSql(): SqlFragment {
        let result: SqlFragment = this.BaseTable.GetSql() as unknown as SqlFragment
        for(const { type, to, on } of this.Entries){
            switch(type){
                case "inner":
                    result = null === on
                        ? sql.fragment`${result} inner join ${to.GetSql()}`
                        : sql.fragment`${result} inner join ${to.GetSql()} on ${on}`
                    continue
                case "left":
                    result = null === on
                        ? sql.fragment`${result} left outer join ${to.GetSql()}`
                        : sql.fragment`${result} left outer join ${to.GetSql()} on ${on}`
                    continue
                case "right":
                    result = null === on
                        ? sql.fragment`${result} right outer join ${to.GetSql()}`
                        : sql.fragment`${result} right outer join ${to.GetSql()} on ${on}`
                    continue
                case "cross":
                    result = null === on
                        ? sql.fragment`${result} cross join ${to.GetSql()}`
                        : sql.fragment`${result} cross join ${to.GetSql()} on ${on}`
                    continue
            }
        }
        return result
    }
}
