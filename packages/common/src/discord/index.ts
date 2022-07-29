import { Client } from 'discord.js'
import { DISCORD_TOKEN } from '../env.js'
export namespace Discord {
    export function createClient(): Client {
        return new Client({
            intents: [
                'Guilds',
                'GuildMembers',
                'GuildMessages',
                'GuildMessageReactions',
            ]
        })
    }

    export function login(client: Client): Promise<string> {
        return client.login(DISCORD_TOKEN)
    }
}
