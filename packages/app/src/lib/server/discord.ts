import { Discord as DiscordNS } from '@glenna/common'
export const Discord = DiscordNS.createClient()
await DiscordNS.login(Discord)
