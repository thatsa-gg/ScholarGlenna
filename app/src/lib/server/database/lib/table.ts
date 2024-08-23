import { Schema } from "./schema"
import { type BuilderAsColumn, type AnyColumnBuilder, Columns, ColumnBuilder } from "./columns"
import { sql, type IdentifierSqlToken, type SqlFragment } from "slonik"
import type { Column, ColumnMode } from "./column"
import { z } from "zod"
import { Sql } from "./sql"
import type { Deletable, Selectable } from "./interfaces"
import { Join } from "./join"

export type TableColumns = Record<Exclude<string, keyof typeof Table>, AnyColumnBuilder>
export type ColumnsFromTable<T> = T extends Table<Schema<string>, string, infer TCol> ? TCol : never
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
export type UpdateMap<T extends TableColumns> = Partial<InputColumns<T>>
type ReturningMap<T extends TableColumns> = Record<string, keyof RealColumns<T>>
type ReturningSql<T extends TableColumns, R extends ReturningMap<T>> = SqlQueryType<z.ZodObject<{
    [key in keyof R]: RealColumns<T>[R[key]]['OutputType']
}, "strict">>

class TypeExtractor<T extends z.ZodTypeAny> { type(e: T){ return sql.type(e)`` }}
type SqlQueryType<T extends z.ZodTypeAny = z.ZodObject<{}, "strict">> = ReturnType<TypeExtractor<T>['type']>

export type InputPermissionMap<T extends TableColumns> = {
    [key in keyof InputColumns<T>]: key extends `Permission${string}` ? InputColumns<T>[key] : never
}

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

    AsSql(): IdentifierSqlToken {
        return sql.identifier([
            this._.Schema.Name,
            this._.Name
        ])
    }

    InsertFragment(...columns: (keyof TColumns)[]): SqlFragment {
        return sql.fragment`
            insert into ${this.AsSql()}(${sql.join(
                columns.map(col => this._.Columns[col].AsSql("plain")),
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
                    column.AsSql("plain"),
                    column.InputType.parse(value)
                ]
            })
        return sql.fragment`
            insert into ${this.AsSql()}(${sql.join(
                entries.map(pair => pair[0]),
                sql.fragment`, `
            )}) values (${sql.join(
                entries.map(pair => pair[1]),
                sql.fragment`, `
            )})
        `
    }

    Insert(values: InsertMap<TColumns>): SqlQueryType
    Insert<R extends ReturningMap<TColumns>>(values: InsertMap<TColumns>, returning: R): ReturningSql<TColumns, R>
    Insert<R extends ReturningMap<TColumns> = {}>(values: InsertMap<TColumns>, returning?: ReturningMap<TColumns>): ReturningSql<TColumns, R> | SqlQueryType {
        const fragment = this.InsertValuesFragment(values)
        if(!returning)
            return Sql.Void`${fragment}`

        const type = z.object(Object.fromEntries(Object.entries(returning)
            .map(([ property, column ]) => [
                property,
                this._.Columns[column].OutputType
            ]))).strict()
        const columns = Object.entries(returning)
            .map(([ property, column ]) => sql.fragment`${this._.Columns[column].AsSql("plain")} as ${sql.identifier([ property ])}`)
        return sql.type(type)`
            ${this.InsertValuesFragment(values)}
            returning
                ${sql.join(columns, sql.fragment`, `)}
        `
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
            update ${this.AsSql()} set ${sql.join(
                Object.entries(values)
                    .filter(pair => pair[1] !== undefined)
                    .map(([ property, value ]) =>
                        sql.fragment`${this._.Columns[property as keyof TColumns].AsSql("plain")} = ${value as any}`),
                sql.fragment`, `
            )}
        `
    }

    Upsert(values: InsertMap<TColumns>, key: (keyof TColumns)[]): SqlQueryType
    Upsert<R extends ReturningMap<TColumns>>(values: InsertMap<TColumns>, key: (keyof TColumns)[], returning: R): ReturningSql<TColumns, R>
    Upsert<R extends ReturningMap<TColumns> = {}>(values: InsertMap<TColumns>, key: (keyof TColumns)[], returning?: R): ReturningSql<TColumns, R> | SqlQueryType {
        const fragment = sql.fragment`
        ${this.UpdateValuesFragment(values as UpdateMap<TColumns>)}
        on conflict (${sql.join(key.map(a => this._.Columns[a].AsSql("plain")), sql.fragment`, `)})
        do update set
            (${sql.join(Object.keys(values).map(a => this._.Columns[a].AsSql("plain")), sql.fragment`, `)}) =
            (${sql.join(Object.keys(values).map(a => this._.Columns[a].AsSql("excluded")), sql.fragment`, `)})
        `

        if(!returning)
            return Sql.Void`${fragment}`

        const type = z.object(Object.fromEntries(Object.entries(returning)
            .map(([ property, column ]) => [
                property,
                this._.Columns[column].OutputType
            ]))).strict()
        const columns = Object.entries(returning)
            .map(([ property, column ]) => sql.fragment`${this._.Columns[column].AsSql("plain")} as ${sql.identifier([ property ])}`)
        return sql.type(type)`${fragment} returning ${sql.join(columns, sql.fragment`, `)}`
    }

    Exists(filter: SqlFragment){
        return sql.fragment`exists (select 1 from ${this.AsSql()} where ${filter})`
    }

    DeleteFragment(): SqlFragment {
        return sql.fragment`delete from ${this.AsSql()}`
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
