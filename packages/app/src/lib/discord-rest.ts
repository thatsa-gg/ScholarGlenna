import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'
import { DISCORD_TOKEN } from './auth'
import type { User as DiscordUser } from 'discord.js'
import { Discord } from './discord'

export const BASE_URI = 'https://discord.com/api/v10'
export const discord = new REST({ version: '10' })
    .setToken(DISCORD_TOKEN)

export async function getUserInfo(accessToken: string, ...args: Parameters<typeof Routes.user>): Promise<DiscordUser> {
    const uri = `${BASE_URI}${Routes.user(...args)}`
    const request = await fetch(uri, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
    const response = await request.json()
    if(response.error)
        throw new Error(response.error)
    return await Discord.users.fetch(response.id)
}
