import { Schema } from "./schema"
import { type BuilderAsColumn, type AnyColumnBuilder, Columns, ColumnBuilder } from "./columns"
import { sql, type IdentifierSqlToken, type SqlFragment } from "slonik"
import type { Column, ColumnMode } from "./column"
import type { z } from "zod"
import { Sql } from "./sql"
import type { Deletable, Selectable } from "./interfaces"
import { Join } from "./join"

export type TableColumns = Record<Exclude<string, keyof typeof Table>, AnyColumnBuilder>
type RealColumns<T extends TableColumns> = {
    [key in keyof T]: key extends string
        ? BuilderAsColumn<key, T[key]>
        : never
}

type InputColumns<T extends TableColumns> = {
    [key in keyof RealColumns<T> as
            RealColumns<T>[key] extends Column<string, string, z.ZodTypeAny, z.ZodTypeAny, ColumnMode.PrimaryKey>
                ? never
                : key
    ]:
        RealColumns<T>[key] extends Column<string, string, z.ZodTypeAny, infer TIn, ColumnMode>
            ? z.infer<TIn> | SqlFragment
            : never
}

type UndefinedKeys<T> = { [key in keyof T]: undefined extends T[key] ? key : never }[keyof T]
type InsertMap<T extends TableColumns> =
    & Omit<InputColumns<T>, UndefinedKeys<InputColumns<T>>>
    & Partial<Pick<InputColumns<T>, UndefinedKeys<InputColumns<T>>>>
type UpdateMap<T extends TableColumns> = Partial<InputColumns<T>>
type ReturningMap<T extends TableColumns> = Record<string, keyof RealColumns<T>>

class TypeExtractor<T extends z.ZodTypeAny> { type(e: T){ return sql.type(e)`` }}
type SqlQueryType<T extends z.ZodTypeAny = z.ZodObject<{}, "strict">> = ReturnType<TypeExtractor<T>['type']>

export type ExtendedTable<
    TSchema extends Schema<string> = Schema<string>,
    TName extends string = string,
    TColumns extends TableColumns = TableColumns
> = Table<TSchema, TName, TColumns> & RealColumns<TColumns>

export class Table<
    TSchema extends Schema<string> = Schema<string>,
    TName extends string = string,
    TColumns extends TableColumns = TableColumns
> implements Selectable, Deletable {
    _: { Schema: TSchema, Name: TName, Columns: RealColumns<TColumns> }
    private constructor(schema: TSchema, name: TName){
        this._ = {
            Schema: schema,
            Name: name,
            Columns: null!, // populated in Create()
        }
    }

    static Create<
        TSchema extends Schema<string>,
        TName extends string,
        TColumns extends TableColumns
    >(schema: TSchema, name: TName, columns: TColumns){
        const table = new Table(schema, name) as ExtendedTable<TSchema, TName, TColumns>
        const built = Object.fromEntries(Object.entries(columns)
            .map(([ property, builder ]) => [
                property,
                builder.Build(table, property)
            ])) as RealColumns<TColumns>
        table._.Columns = built
        return Object.assign(table, built) satisfies ExtendedTable<TSchema, TName, TColumns>
    }

    GetSql(): IdentifierSqlToken {
        return sql.identifier([
            this._.Schema.Name,
            this._.Name
        ])
    }

    InsertFragment(...columns: (keyof TColumns)[]): SqlFragment {
        return sql.fragment`
            insert into ${this.GetSql()}(${sql.join(
                columns.map(col => this._.Columns[col].GetSql("plain")),
                sql.fragment`, `
            )})
        `
    }

    InsertValuesFragment(values: InsertMap<TColumns>){
        const entries = Object.entries(values)
            .filter(([, value ]) => typeof value !== 'undefined')
            .map(([ property, value ]) => {
                const column = this._.Columns[property as keyof TColumns]
                return [
                    column.GetSql("plain"),
                    column.InputType.parse(value)
                ]
            })
        return sql.fragment`
            insert into ${this.GetSql()}(${sql.join(
                entries.map(pair => pair[0]),
                sql.fragment`, `
            )}) values (${sql.join(
                entries.map(pair => pair[1]),
                sql.fragment`, `
            )})
        `
    }

    Insert(value: InsertMap<TColumns>): SqlQueryType
    Insert<R extends ReturningMap<TColumns>>(values: InsertMap<TColumns>, returning?: R): SqlQueryType<z.ZodObject<{
        [key in keyof R]: RealColumns<TColumns>[R[key]]['OutputType']
    }, "strict">>
    Insert<R extends ReturningMap<TColumns> = {}>(values: InsertMap<TColumns>, returning?: ReturningMap<TColumns>): SqlQueryType<z.ZodObject<{
        [key in keyof R]: RealColumns<TColumns>[R[key]]['OutputType']
    }>> | SqlQueryType {
        const entries = Object.entries(values)
            .filter(([, value ]) => typeof value !== 'undefined')
            .map(([ property, value ]) => {
                const column = this._.Columns[property as keyof TColumns]
                return [
                    column.GetSql("plain"),
                    column.InputType.parse(value)
                ]
            })
        if(!returning){
            return Sql.Void`
                ${""}
            `
        }
        return Sql.Void``
    }

    Update(values: UpdateMap<TColumns>, where?: SqlFragment){
        const fragment = this.UpdateValuesFragment(values)
        if(where)
            return Sql.Void`${fragment} where ${where}`
        else
            return Sql.Void`${fragment}`
    }

    UpdateValuesFragment(values: UpdateMap<TColumns>){
        return sql.fragment`
            update ${this.GetSql()} set ${sql.join(
                Object.entries(values)
                    .filter(pair => pair[1] !== undefined)
                    .map(([ property, value ]) =>
                        sql.fragment`${this._.Columns[property as keyof TColumns].GetSql("plain")} = ${value as any}`),
                sql.fragment`, `
            )}
        `
    }

    Exists(filter: SqlFragment){
        return sql.fragment`exists (select 1 from ${this.GetSql()} where ${filter})`
    }

    DeleteFragment(): SqlFragment {
        return sql.fragment`delete from ${this.GetSql()}`
    }

    InnerJoin<TColumn extends keyof TColumns>(column: TColumn, references: Column){
        return new Join(this, "inner", references._.Table, this._.Columns[column].Condition("=", references))
    }

    LeftOuterJoin<TColumn extends keyof TColumns>(column: TColumn, references: Column){
        return new Join(this, "left", references._.Table, this._.Columns[column].Condition("=", references))
    }

    RightOuterJoin<TColumn extends keyof TColumns>(column: TColumn, references: Column){
        return new Join(this, "right", references._.Table, this._.Columns[column].Condition("=", references))
    }

    CrossJoin<TColumn extends keyof TColumns>(column: TColumn, references: Column){
        return new Join(this, "cross", references._.Table, this._.Columns[column].Condition("=", references))
    }
}
