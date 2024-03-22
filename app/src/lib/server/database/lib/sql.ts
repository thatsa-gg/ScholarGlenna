import type { TempGuild } from "../schema/table-tempguild"
import type { User } from "../schema/table-user"
import type { Guild } from "../schema/table-guild"
import type { IntervalInput } from "slonik/dist/types"
import { sql, type SqlFragment } from "slonik"
import { z } from "zod"
import { Column } from "./column"
import { Table, type TableColumns } from "./table"
import type { Deletable, Selectable } from "./interfaces"
import type { Schema } from "./schema"

type Tables =
    | typeof Guild
    | typeof TempGuild
    | typeof User

export namespace Sql {
    const VoidType = z.object({}).strict()

    export function Truncate<TTable extends Tables>(table: TTable){
        return sql.type(VoidType)`
            truncate ${table.GetSql()}
        `
    }

    export const Void = sql.type(VoidType)
    export const Fragment = sql.fragment
    export const Now = sql.fragment`NOW()`

    export function Columns(columns: Record<string, Column>){
        return sql.join(
            Object.entries(columns)
                .map(([ key, column ]) =>
                    sql.fragment`${column.GetSql()} as ${sql.identifier([ key ])}`),
            sql.fragment`, `
        )
    }

    export function Select<T extends Record<string, Column>>
        (columns: T, from: Selectable, where?: SqlFragment)
    {
        const type = z.object(
            Object.fromEntries(Object.entries(columns).map(([ property, column ]) =>
                [ property, column.OutputType ] as const))).strict() as z.ZodObject<{
                    [k in keyof T]: T[k]['OutputType']
                }>
        return sql.type(type)`
            select ${Columns(columns)}
            from ${from.GetSql()}
            ${where ? sql.fragment`where ${where}` : sql.fragment``}
        `
    }

    export function SelectDistinct<T extends Record<string, Column>>
        (columns: T, from: Selectable, where?: SqlFragment)
    {
        const type = z.object(
            Object.fromEntries(Object.entries(columns).map(([ property, column ]) =>
                [ property, column.OutputType ] as const))).strict() as z.ZodObject<{
                    [k in keyof T]: T[k]['OutputType']
                }>
        return sql.type(type)`
            select distinct ${Columns(columns)}
            from ${from.GetSql()}
            ${where ? sql.fragment`where ${where}` : sql.fragment``}
        `
    }

    type UpdateColumns<TTable extends Table> = Parameters<TTable["UpdateValuesFragment"]>[0]
    export function Update<TTable extends Table>
        (table: TTable, columns: UpdateColumns<TTable>, where: SqlFragment)
    {
        return Sql.Void`
            ${table.UpdateValuesFragment(columns)}
            where
                ${where}
        `
    }

    type InsertColumns<TTable extends Table> = Partial<Parameters<TTable["InsertValuesFragment"]>[0]>
    type StringKeys<K extends PropertyKey> = K extends string ? K : never
    export function UpsertReturning<
        TTable extends Table,
        TValues extends InsertColumns<TTable>,
        TReturning extends Record<string, Column<StringKeys<keyof TTable["_"]["Columns"]>>>
    >
        (table: TTable, { values, conflicting, returning }: {
            values: TValues,
            conflicting: Array<keyof TTable["_"]["Columns"]>,
            returning: TReturning
        })
    {
        const type = z.object(Object.fromEntries(Object.entries(values.returning ?? {})
            .map(([ property, column ]) => [ property, (column as Column).OutputType ] as const)
        )).strict() as z.ZodObject<{ [k in keyof TReturning]: TReturning[k]['OutputType'] }>
        const conflictingCols = conflicting.map(a => sql.identifier([ table._.Columns[a as any]._.ColumnName ]))
        const updateCols = Object.keys(values).map(key => table._.Columns[key as any]._.ColumnName)
        const returningCols = Object.entries(returning).map(([property, column]) =>
            sql.fragment`${sql.identifier([ column._.ColumnName ])} as ${sql.identifier([ property ])}`)

        if(updateCols.length <= 0)
            throw "Must set one or more columns in upsert."
        if(returningCols.length <= 0)
            throw "Must return one or more columns from upsert."

        return sql.type(type)`
            ${table.InsertValuesFragment(values)}
            on conflict (${sql.join(conflictingCols, sql.fragment`, `)})
            do update set
                (${sql.join(updateCols.map(a => sql.identifier([ a ])), sql.fragment`, `)}) =
                (${sql.join(updateCols.map(a => sql.fragment`excluded.${sql.identifier([ a ])}`), sql.fragment`, `)})
            returning
                ${sql.join(returningCols, sql.fragment`, `)}
        `
    }

    export function Delete(target: Deletable, where: SqlFragment){
        return Sql.Void`${target.DeleteFragment()} where ${where}`
    }

    export namespace Array {
        export function BigInt(items: bigint[]){
            return sql.array(items, sql.fragment`bigint[]`)
        }
    }

    /**
     * @param interval The interval to offset by.
     * @returns A fragment representing `NOW() - $Interval`
     */
    export function OffsetDate(interval: IntervalInput){
        return sql.fragment`(NOW() - ${sql.interval(interval)})`
    }

    export function Or(...conditions: SqlFragment[]): SqlFragment {
        return sql.fragment`(${sql.join(conditions, sql.fragment` or `)})`
    }

    export function And(...conditions: SqlFragment[]): SqlFragment {
        return sql.fragment`(${sql.join(conditions, sql.fragment` and `)})`
    }

    export function As(item: SqlFragment | Column, name: string){
        if(item instanceof Column)
            return sql.fragment`${item.GetSql()} as ${sql.identifier([ name ])}`
        else
            return sql.fragment`(${item}) as ${sql.identifier([ name ])}`
    }

    export function NotExists(target: Selectable, condition: SqlFragment): SqlFragment {
        return sql.fragment`
            not exists (
                select 1 from
                    ${target.GetSql()}
                where
                    ${condition}
            )
        `
    }
}
