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
