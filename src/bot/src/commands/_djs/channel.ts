import { custom, extend } from './_common.js'
import { BaseChannel } from '@glenna/discord'
import type {
    SlashCommandChannelOption,
    ApplicationCommandOptionAllowedChannelTypes,
    ChannelType,
    TextChannel,
    VoiceChannel,
    CategoryChannel,
    NewsChannel,
    StageChannel,
    ForumChannel,
    PublicThreadChannel,
    PrivateThreadChannel,
} from '@glenna/discord'
import { Builders, Fetchers } from './_builder.js'

type RealChannelType<T extends ApplicationCommandOptionAllowedChannelTypes> =
    T extends ChannelType.GuildText ? TextChannel
    : T extends ChannelType.GuildVoice ? VoiceChannel
    : T extends ChannelType.GuildCategory ? CategoryChannel
    : T extends ChannelType.GuildAnnouncement ? NewsChannel
    : T extends ChannelType.GuildStageVoice ? StageChannel
    : T extends ChannelType.GuildForum ? ForumChannel
    : T extends ChannelType.AnnouncementThread ? PublicThreadChannel & { type: ChannelType.AnnouncementThread }
    : T extends ChannelType.PublicThread ? PublicThreadChannel
    : T extends ChannelType.PrivateThread ? PrivateThreadChannel
    : never

const Channel = Symbol('djs-channel')
export function channel<T extends ApplicationCommandOptionAllowedChannelTypes>(channelTypes?: T[]){
    const handler = custom<RealChannelType<T>>(Channel, candidate =>
        candidate instanceof BaseChannel
        && ((channelTypes as ChannelType[] | undefined)?.includes(candidate.type) ?? true))
    if(!channelTypes)
        return handler
    return extend(handler, {
        builder(builder: SlashCommandChannelOption){
            return builder.addChannelTypes(...channelTypes)
        }
    })
}
Fetchers.set(Channel, (name, required) => interaction => interaction.options.getChannel(name, required))
Builders.set(Channel, (name, description, required, accessory) => builder => builder.addChannelOption(option => {
    accessory?.(option)
    option.setName(name)
    option.setRequired(required)
    if(description)
        option.setDescription(description)
    return option
}))
