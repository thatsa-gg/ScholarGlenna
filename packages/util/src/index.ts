import { Temporal } from '@js-temporal/polyfill'
import { readdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import {
    dirname as pathDirname,
    resolve as pathResolve,
    join as pathJoin
} from 'path/posix'

export function minutes(minutes: number): Temporal.Duration {
    return new Temporal.Duration(0, 0, 0, 0, 0, minutes, 0, 0, 0, 0)
}
export function seconds(seconds: number): Temporal.Duration {
    return new Temporal.Duration(0, 0, 0, 0, 0, 0, seconds, 0, 0, 0)
}
export function sleep(duration: Temporal.Duration){
    return new Promise(fn => setTimeout(fn, duration.milliseconds))
}

export type Inclusivity = 'Inclusive' | 'Exclusive'
export type Integer = number & { __TYPE__: "INTEGER" }
export type Range = [ min: Integer, max: Integer ] & { __TYPE__: "RANGE" } // always exclusive
export function isInteger(candidate: number): boolean {
    return Number.isInteger(candidate)
}
export function range(from: number, to: number, inclusive: Inclusivity = 'Exclusive'): Range {
    if(!isInteger(from))
        throw new Error("`from` is not an integer.")
    if(!isInteger(to))
        throw new Error("`to` is not an integer.")
    if(inclusive)
        to += 1
    return [ from, to ] as Range
}
export function random(range: Range){
    const [ from, to ] = range
    return from + Math.floor(Math.random() * (to - from))
}
export function randomFrom<T>(items: T[]): T {
    return items[random(range(0, items.length, 'Exclusive'))]!
}
export function start(promise: Promise<void>): void {
    // nop. promise will do its thing by itself.
    void promise
}

export function dirname(meta: ImportMeta): string {
    const filename = fileURLToPath(meta.url)
    return pathDirname(filename)
}

export function resolve(meta: ImportMeta, path: string): string {
    return pathResolve(dirname(meta), path)
}

export async function load<T>(meta: ImportMeta, path: string, recurse: boolean = false): Promise<T[]> {
    const directory = [ resolve(meta, path) ]
    const files: string[] = []
    while(directory.length > 0){
        const next = directory.shift()!
        for(const file of await readdir(next, { withFileTypes: true })){
            if(recurse && file.isDirectory())
                directory.push(pathJoin(next, file.name))
            else if(file.isFile() && file.name.endsWith('.js'))
                files.push(pathResolve(next, file.name))
        }
    }
    const results = await Promise.all(files
        .map(a => import(a) as Promise<{ default: T }>))
    return results.map(a => a.default)
}

export async function *loadAsync<T>(meta: ImportMeta, path: string, recurse: boolean = false): AsyncGenerator<T> {
    const directory = [ resolve(meta, path) ]
    while(directory.length > 0){
        const next = directory.shift()!
        for(const item of await readdir(next, { withFileTypes: true })){
            const itemPath = pathJoin(next, item.name)
            if(recurse && item.isDirectory())
                directory.push(itemPath)
            else if(item.isFile() && item.name.endsWith('.js')){
                const content = await import(itemPath) as { default: T }
                yield content.default
            }
        }
    }
}

type Executor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void
export class LazyPromise<T> extends Promise<T> {
    #executor: Executor<T>
    #promise: Promise<T> | null = null
    constructor(executor: Executor<T>){
        super(resolve => { resolve(undefined!) })
        this.#executor = executor
    }

    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
    ): Promise<TResult1 | TResult2> {
        this.#promise ??= new Promise<T>(this.#executor)
        return this.#promise.then(onfulfilled, onrejected)
    }

    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult> {
        this.#promise ??= new Promise<T>(this.#executor)
        return this.#promise.catch(onrejected)
    }

    static from<T>(fn: () => T): LazyPromise<T> {
        return new LazyPromise(resolve => resolve(fn()))
    }
}

export type JsonSafe<T> =
    T extends Function ? null
    : T extends bigint ? string
    : T extends Date ? T
    : T extends Array<infer R extends object> ? Array<JsonSafe<R>>
    : T extends object ? { [key in keyof T]: JsonSafe<T[key]> }
    : T
export function asJsonSafe<T>(object: T): JsonSafe<T>{
    if(Array.isArray(object))
        return Array.from(object, item => asJsonSafe(item)) as JsonSafe<T>
    if(object instanceof Date)
        return object as JsonSafe<T>
    switch(typeof object){
        case 'function': return null as JsonSafe<T>
        case 'bigint': return object.toString() as JsonSafe<T>
        case 'object': return Object.fromEntries(Object.entries(object as unknown as {[key: PropertyKey]: unknown}).map(([key, value]) => [key, asJsonSafe(value)])) as JsonSafe<T>
        default: return object as JsonSafe<T>
    }
}

export function select<T extends object, K extends keyof T>(object: T, ...keys: K[]): Pick<T, K> {
    return Object.assign({}, ...keys.map(key => ({ [key]: object[key] })))
}

export function slugify(source: string): string {
    return source.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export type FieldHistory<T> = {
    field: keyof T
    old: string | number | null
    new: string | number | null
}

export function assertExhaustive(a: never): never {
    throw new Error(`Switch statement was not exhaustive. Encountered unknown value: ${a}`);
}

export function asRGB(color: number){
    return `#${color.toString(16).padStart(6, '0')}`
}

export function formatDuration(duration: Temporal.Duration){
    const dur = duration.round({ largestUnit: 'hours' })
    return `${dur.hours}:${dur.minutes.toString().padStart(2, '0')}`
}

export function roundWeek(time: Temporal.ZonedDateTime){
    return time.round({ smallestUnit: 'day', roundingMode: 'floor' }).subtract({ days: time.dayOfWeek })
}
