import { ChannelType, Guild, TextChannel } from 'discord.js'
export async function sendWelcomeMessage(guild: Guild){
    const self = await guild.members.fetchMe()
    const channels = await guild.channels.fetch()
        .then(channels => channels.filter(channel => channel && channel.type == ChannelType.GuildText && channel.permissionsFor(self).has('SendMessages')))
    const channel = guild.systemChannelId && channels.has(guild.systemChannelId)
        ? channels.get(guild.systemChannelId) as TextChannel | null
        : channels.at(0) as TextChannel | null
    await channel?.send({
        content: `Excelsior! I got your message and have come to assist. For the most part I can follow orders, but if you need anything specific be sure to "/glenna help"!`
    })
}
