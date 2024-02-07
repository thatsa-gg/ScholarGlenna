import { createPool, type DatabasePool, type DatabaseConnection, sql } from 'slonik'
import { DATABASE_URL } from "../env.js"

let instance: DatabasePool | null = null
export namespace Database {
    export async function initialize(){
        instance = await createPool(DATABASE_URL, {})
    }

    export function get(): DatabaseConnection {
        return instance!
    }

    export function anyBigintArray(ids: (string | bigint | { id: string })[]){
        const values = ids.map(id =>
                typeof id === 'string' ? id :
                typeof id === 'bigint' ? id.toString() :
                id.id)
        return sql.fragment`ANY(${sql.array(values, sql.fragment`bigint[]`)})`
    }

    export function anyNumberArray(ids: number[]){
        return sql.fragment`ANY(${sql.array(ids, sql.fragment`integer[]`)})`
    }

    export const Now = sql.fragment`NOW()`
}
