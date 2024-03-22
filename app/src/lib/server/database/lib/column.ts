import type { z } from "zod"
import type { Table } from "./table"
import { sql, type IdentifierSqlToken, type SqlFragment, type ArraySqlToken, isSqlToken, type SqlToken } from "slonik"
import { ArrayToken } from "slonik/dist/tokens"

export enum ColumnFlags {
    None        = 0,
    Nullable    = 1 << 0,
    Unique      = 1 << 1,
    PrimaryKey  = 1 << 2,
    Default     = 1 << 3,
    References  = 1 << 4,
}

export enum ColumnMode {
    Normal,
    PrimaryKey, // Not allowed for insert
    Optional,   // Not required for insert
}

export type Condition =
    | "="
    | "<>"
    | "<"
    | ">"
    | "<="
    | ">="
    | "is null"
    | "is not null"

type ConditionValue<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny> =
    | SqlFragment
    | ArraySqlToken
    | z.infer<TInput>
    | Column<string, string, TOutput, TInput>

export class Column<
    TPropertyName extends string = string,
    TColumnName extends string = string,
    TOutput extends z.ZodTypeAny = z.ZodTypeAny,
    TInput extends z.ZodTypeAny = z.ZodTypeAny,
    TMode extends ColumnMode = ColumnMode,
> {
    _
    OutputType: TOutput
    InputType: TInput
    constructor(
        property: TPropertyName,
        table: Table,
        name: TColumnName,
        sqlType: string,
        flags: ColumnFlags,
        inputType: TInput,
        outputType: TOutput,
        mode: TMode,
    ){
        this.OutputType = outputType
        this.InputType = inputType
        this._ = {
            Table: table,
            ColumnName: name,
            mode: mode
        }
    }

    GetSql(style?: "full" | "plain"): IdentifierSqlToken
    GetSql(style: "reference"): SqlFragment
    GetSql(style: "full" | "plain" | "reference" = "full"): IdentifierSqlToken | SqlFragment {
        switch(style){
            case "plain": return sql.identifier([ this._.ColumnName ])
            case "full":
                return sql.identifier([
                    this._.Table._.Schema.Name,
                    this._.Table._.Name,
                    this._.ColumnName,
                ])
            case "reference":
                return sql.fragment`${this._.Table.GetSql()}(${sql.identifier([ this._.ColumnName ])})`
        }
    }

    Condition(condition: Extract<Condition, "is null" | "is not null">): SqlFragment
    Condition(condition: Exclude<Condition, "is null" | "is not null">, value: ConditionValue<TInput, TOutput>): SqlFragment
    Condition(condition: Condition, value?: ConditionValue<TInput, TOutput>): SqlFragment {
        switch(condition){
            case "is null":
                return sql.fragment`(${this.GetSql()} is null)`
            case "is not null":
                return sql.fragment`(${this.GetSql()} is not null)`
            default:
                if(value === undefined)
                    throw "Cannot supply an undefined value."
                if(isSqlToken(value) && (value as SqlToken).type === ArrayToken){
                    value = sql.fragment`ANY(${value})`
                } else if(value instanceof Column){
                    value = value.GetSql("full")
                }
                switch(condition){
                    case "=":
                        return sql.fragment`(${this.GetSql()} = ${value})`
                    case "<>":
                        return sql.fragment`(${this.GetSql()} <> ${value})`
                    case "<":
                        return sql.fragment`(${this.GetSql()} < ${value})`
                    case ">":
                        return sql.fragment`(${this.GetSql()} > ${value})`
                    case "<=":
                        return sql.fragment`(${this.GetSql()} <= ${value})`
                    case ">=":
                        return sql.fragment`(${this.GetSql()} >= ${value})`
                }
        }
    }
}
