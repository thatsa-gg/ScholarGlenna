import type { Awaitable, ClientEvents } from 'discord.js'

export type EventListener<K extends keyof ClientEvents = keyof ClientEvents> = {
    name: K
    once?: boolean
    execute(...args: ClientEvents[K]): Awaitable<void>
}

export function listener<K extends keyof ClientEvents>(name: K, { once, execute }: Omit<EventListener<K>, "name">): EventListener<K> {
    return { name, execute, once }
}
