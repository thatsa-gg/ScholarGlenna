import type { Migration } from './Migration.js'
import { load } from '@glenna/util'
import postgres from 'postgres'
import {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB,
    POSTGRES_USER,
    POSTGRES_PASSWORD
} from '../env.js'

export interface MigrationOptions {
    reset: boolean
    debug: boolean
}
export async function migrate(options: Partial<MigrationOptions>){
    options.reset ??= false
    options.debug ??= false
    if(POSTGRES_DB.match(/[^a-zA-Z0-9]/)){
        throw new Error(`Invalid characters in Postgres DB name: ${POSTGRES_DB}. The name must be alphanumeric.`)
    }
    const migrations = await load<Migration>(import.meta, 'entries')
    migrations.sort((a, b) => a.index - b.index)
    const check = new Set<string | number>()
    for(const { index, name } of migrations){
        if(check.has(index))
            throw `Duplicate index ${index} on migration "${name}".`
        if(check.has(name))
            throw `Duplicate name "${name}" on migration index ${index}.`
        check.add(index).add(name)
    }

    console.log('[common] Running migrations.', options)
    {
        // initialize DB
        console.log('[common] Connecting to database host.')
        const sql = postgres({
            host: POSTGRES_HOST,
            port: POSTGRES_PORT,
            user: POSTGRES_USER,
            password: POSTGRES_PASSWORD,
            debug: options.debug
        })
        if(options.reset){
            console.log('[common-init] Reset requested, dropping database.', POSTGRES_DB)
            await sql`drop database ${ sql(POSTGRES_DB) }`
        }
        const result = await sql`select datname from pg_database where datname=${ POSTGRES_DB }`
        if(result.length < 1){
            console.log('[common-init] Creating database.', POSTGRES_DB)
            await sql`create database ${ sql(POSTGRES_DB) }`
        }
        await sql.end()
    }

    console.log('[common] Reconnecting to database.', POSTGRES_DB)
    const sql = postgres({
        host: POSTGRES_HOST,
        port: POSTGRES_PORT,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        database: POSTGRES_DB,
        debug: options.debug
    })

    console.log('[common-init] Ensuring Migrations table exists.')
    await sql`
        create table if not exists Migrations (
            migration_id serial primary key,
            created_at timestamp with time zone not null default now(),
            name text
        )
    `

    interface MigrationInfo {
        name: string
        created_at: Date
    }
    const completedMigrations = await sql<MigrationInfo[]>`select name, created_at from Migrations`
        .then(rows => new Map(rows.map(row => [ row.name, row.created_at ])))
    for(const { name, execute } of migrations){
        if(completedMigrations.has(name)){
            console.log(`[migration] Skipping "${name}" (already completed on ${completedMigrations.get(name)})`)
            continue
        }
        console.log(`[migration] Processing migration ${name}`)
        console.time(`[migration-${name}]`)
        await sql.begin(async sql => {
            await execute(sql)
            await sql`insert into Migrations (name) values (${ name })`
        })
        console.timeEnd(`[migration-${name}]`)
    }
    await sql.end()
}
