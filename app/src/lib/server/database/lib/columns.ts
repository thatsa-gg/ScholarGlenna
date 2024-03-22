import type { ExtendedTable, Table } from "./table"
import { ZodNullable, ZodOptional, z } from "zod"
import { Column, ColumnFlags, ColumnMode } from "./column"
import type { IdentifierSqlToken, SqlFragment } from "slonik"

type ColumnSqlType = string | IdentifierSqlToken
export type AnyColumnBuilder = ColumnBuilder<string, ColumnSqlType, z.ZodTypeAny, z.ZodTypeAny, ColumnMode>
export class ColumnBuilder<
    TName extends string = string,
    TSqlType extends ColumnSqlType = ColumnSqlType,
    TOutput extends z.ZodTypeAny = z.ZodTypeAny,
    TInput extends z.ZodTypeAny = z.ZodTypeAny,
    TMode extends ColumnMode = ColumnMode
>{
    Name: TName
    SqlType: TSqlType
    InputType: TInput
    OutputType: TOutput
    Mode: TMode

    Flags: ColumnFlags = ColumnFlags.None
    DefaultValue: z.input<TInput> | SqlFragment | undefined = undefined
    ReferenceColumn: Column | undefined = undefined

    constructor(name: TName, mode: TMode, sqlType: TSqlType, zodType: TInput | TOutput){
        this.Name = name
        this.SqlType = sqlType
        this.InputType = zodType as unknown as TInput
        this.OutputType = zodType as unknown as TOutput
        this.Mode = mode
    }

    PrimaryKey(){
        const self = this as unknown as ColumnBuilder<TName, TSqlType, TOutput, TInput, ColumnMode.PrimaryKey>
        self.Flags |= ColumnFlags.PrimaryKey
        self.Mode = ColumnMode.PrimaryKey
        return self
    }

    Unique(){
        this.Flags |= ColumnFlags.Unique
        return this
    }

    Nullable(){
        const self = this as unknown as ColumnBuilder<TName, TSqlType, ZodNullable<TOutput>, ZodNullable<TInput>, TMode>
        self.Flags |= ColumnFlags.Nullable
        self.OutputType = this.OutputType.nullable()
        self.InputType = this.InputType.nullable()
        return self
    }

    Optional(){
        const self = this as unknown as ColumnBuilder<TName, TSqlType, ZodNullable<TOutput>, ZodOptional<ZodNullable<TInput>>, ColumnMode.Optional>
        self.Flags |= ColumnFlags.Nullable
        self.OutputType = this.OutputType.nullable()
        self.InputType = this.InputType.nullable().optional()
        self.Mode = ColumnMode.Optional
        return self
    }

    References<TTable extends Table>(table: () => [ TTable, string ]){
        this.Flags |= ColumnFlags.References
        const self = this as unknown

        // TODO: column
        return this
    }

    Default(value: z.input<TInput> | SqlFragment){
        this.Flags |= ColumnFlags.Default
        this.DefaultValue = value
        return this
    }

    Accept<TAccept extends z.ZodTypeAny>(accept: TAccept){
        const self = this as unknown as ColumnBuilder<TName, TSqlType, TOutput, TAccept, TMode>
        self.InputType = accept
        return self
    }

    Build<TTable extends ExtendedTable, TProperty extends string>(table: TTable, property: TProperty){
        return new Column<TProperty, TName, TOutput, TInput, TMode>(
            property,
            table,
            this.Name,
            [
                this.SqlType,
                this.Flags & ColumnFlags.PrimaryKey ? "primary key" : null,
                this.Flags & ColumnFlags.Unique ? "unique" : null,
                this.Flags & ColumnFlags.Nullable ? "" : "not null",
                this.Flags & ColumnFlags.Default ? `default ${null}` : null, // TODO
                this.Flags & ColumnFlags.References ? `references` : null, // TODO
            ].filter(a => null !== a).join(" "),
            this.Flags,
            this.InputType,
            this.OutputType,
            this.Mode,
        )
    }
}

export type BuilderAsColumn<P extends string, T extends ColumnBuilder> =
    T extends ColumnBuilder<infer N, ColumnSqlType, infer I, infer O, infer M>
        ? Column<P, N, I, O, M>
        : never

export namespace Columns {
    export function PrimaryKey<T extends string>(name: T){
        return new ColumnBuilder(name, ColumnMode.PrimaryKey, "serial", z.number().int())
            .PrimaryKey()
    }

    export function DiscordId<T extends string>(name: T){
        return new ColumnBuilder(name, ColumnMode.Normal, "bigint", z.bigint())
            .Accept(z.bigint().or(z.string()))
    }

    export function Text<T extends string>(name: T){
        return new ColumnBuilder(name, ColumnMode.Normal, "text", z.string())
    }

    export function VarChar<TLength extends number, TName extends string>(length: TLength, name: TName){
        return new ColumnBuilder(name, ColumnMode.Normal, `varchar(${length})`, z.string().max(length))
    }

    export function Timestamp<T extends string>(name: T){
        return new ColumnBuilder(name, ColumnMode.Normal, "timestamp", z.date())
    }

    export function Integer<T extends string>(name: T){
        return new ColumnBuilder(name, ColumnMode.Normal, "integer", z.number().int())
    }

    export function Boolean<T extends string>(name: T){
        return new ColumnBuilder(name, ColumnMode.Normal, "boolean", z.boolean())
    }
}
