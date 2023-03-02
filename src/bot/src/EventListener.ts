import type { Awaitable, Client, ClientEvents } from '@glenna/discord'

export type EventListener<K extends keyof ClientEvents = keyof ClientEvents> = {
    name: K
    once?: boolean
    execute(...args: ClientEvents[K]): Awaitable<void>,
    register(client: Client): void
}

export function listener<K extends keyof ClientEvents>(name: K, { once, execute }: Omit<EventListener<K>, "name" | "register">): EventListener<K> {
    return {
        name,
        execute,
        once,
        register(client: Client){
            if(this.once)
                client.once(this.name, this.execute)
            else
                client.on(this.name, this.execute)
        }
    }
}
