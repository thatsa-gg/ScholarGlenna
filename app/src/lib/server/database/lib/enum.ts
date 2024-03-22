import { sql, type IdentifierSqlToken, type SqlFragment } from "slonik"
import type { Schema } from "./schema"
import { z } from "zod"
import { ColumnBuilder } from "./columns"
import { ColumnMode } from "./column"

export type EnumLike = {
    [k: string]: string
}
export type EnumValue<T extends EnumLike> = T[keyof T]
type EnumFragments<T extends EnumLike> = {
    [key in keyof T]: SqlFragment
}

export class Enum<
    TSchema extends Schema<string>,
    TName extends string,
    TValues extends EnumLike,
>{
    Schema: TSchema
    Name: TName
    Values: TValues
    Identity: IdentifierSqlToken
    Type: z.ZodNativeEnum<TValues>
    Fragments: EnumFragments<TValues>

    constructor(schema: TSchema, name: TName, values: TValues){
        this.Schema = schema
        this.Name = name
        this.Values = values
        this.Fragments = Object.fromEntries(Object.entries(values)
            .filter(p => typeof p[0] === "string")
            .map(p => [ p[0], sql.literalValue(p[1]) ])) as EnumFragments<TValues>
        this.Identity = sql.identifier([
            schema.Name,
            name
        ])
        this.Type = z.nativeEnum(values)
    }

    Fragment(value: EnumValue<TValues>){
        return sql.literalValue(value)
    }

    Column<TColumnName extends string>(name: TColumnName) {
        return new ColumnBuilder(name, ColumnMode.Normal, this.Identity, this.Type)
    }
}
