import type { TransactionSql } from 'postgres'
type MigrationFn = (sql: TransactionSql<{}>) => Promise<void>
export class Migration {
    index: number
    name: string
    execute: MigrationFn
    constructor(index: number, name: string, options: Omit<Migration, 'name' | 'index'>){
        this.index = index
        this.name = name
        this.execute = options.execute
    }
}
