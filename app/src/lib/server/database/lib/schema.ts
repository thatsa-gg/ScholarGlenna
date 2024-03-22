import { Enum, type EnumLike } from "./enum"
import { type ExtendedTable, type TableColumns, Table } from "./table"

export class Schema<TName extends string> implements Schema<TName> {
    Name: TName

    constructor(name: TName){
        this.Name = name
    }

    static Create<TName extends string>(name: TName){
        return new Schema(name)
    }

    Enum<TEnumName extends string, TValues extends EnumLike>
        (name: TEnumName, values: TValues)
        : Enum<Schema<TName>, TEnumName, TValues>
    {
        return new Enum(this, name, values)
    }

    Table<TTableName extends string, TColumns extends TableColumns>
        (name: TTableName, columns: TColumns)
    {
        return Table.Create(this, name, columns)
    }
}
