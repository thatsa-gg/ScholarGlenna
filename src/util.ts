import { Temporal } from '@js-temporal/polyfill'
import { readdirSync } from 'fs'
import { resolve } from 'path/posix'

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


export function load<T>(path: string, name: string): T[] {
    const directory = resolve(path, name)
    return readdirSync(directory, { 'withFileTypes': true })
        .filter(a => a.isFile() && a.name.endsWith('.js'))
        .map(a => require(resolve(directory, a.name)).default as T)
}
