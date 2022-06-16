import type { Awaitable, ClientEvents } from 'discord.js'

export class EventListener<K extends keyof ClientEvents = keyof ClientEvents> {
    name: K
    once?: boolean
    execute: (...args: ClientEvents[K]) => Awaitable<void>
    constructor(args: Required<EventListener<K>>){
        this.name = args.name
        this.once = args.once ?? false
        this.execute = args.execute
    }
}

export function listener<K extends keyof ClientEvents>(name: K, options: Omit<EventListener<K>, "name">){
    return new EventListener<K>({
        name,
        once: options.once ?? false,
        execute: options.execute
    })
}
