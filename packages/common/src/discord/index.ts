import { Client, Intents } from 'discord.js'
import { DISCORD_TOKEN } from '../env.js'
export namespace Discord {
    export function createClient(): Client {
        return new Client({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            ]
        })
    }

    export function login(client: Client): Promise<string> {
        return client.login(DISCORD_TOKEN)
    }
}
