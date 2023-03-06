import type {
    ApplicationCommandOptionAllowedChannelTypes,
    CategoryChannel,
    ChannelType,
    ChatInputCommandInteraction,
    ForumChannel,
    NewsChannel,
    PrivateThreadChannel,
    PublicThreadChannel,
    SlashCommandBuilder,
    SlashCommandChannelOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    StageChannel,
    TextChannel,
    VoiceChannel
} from '@glenna/discord'
import {
    Role,
    Guild,
    BaseChannel
} from '@glenna/discord'
import { z } from 'zod'

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
const DJSTypeSymbol = Symbol('djs-type')
const DJSBuilderSymbol = Symbol('djs-builder')
function custom<T>(type: string, ...params: Parameters<typeof z.custom<T>>){
    const handler = z.custom<T>(...params)
    handler._def[DJSTypeSymbol] = type
    return handler
}

export namespace djs {
    export function channel<T extends ApplicationCommandOptionAllowedChannelTypes>(channelTypes?: T[]){
        const handler = custom<RealChannelType<T>>('channel', candidate =>
            candidate instanceof BaseChannel
            && ((channelTypes as ChannelType[] | undefined)?.includes(candidate.type) ?? true))
        handler._def[DJSBuilderSymbol] = (builder: SlashCommandChannelOption) => channelTypes ? builder.addChannelTypes(...channelTypes) : builder
        return handler
    }

    export function role(){
        return custom<Role>('role', candidate => candidate instanceof Role)
    }

    export function guild(){
        return custom<Guild>('guild', candidate => candidate instanceof Guild)
    }

    export function string(builder: (option: SlashCommandStringOption) => SlashCommandStringOption){
        const handler = z.string()
        handler._def[DJSBuilderSymbol] = builder
        return handler
    }
}

function inspectType(zodType: z.ZodTypeAny){
    let obj = zodType._def
    let type: string
    let description: string | undefined = undefined
    let builder: any
    while(obj){
        if('description' in obj)
            description ??= obj.description
        if('innerType' in obj){
            obj = obj.innerType._def
            continue
        }
        if('schema' in obj){
            obj = obj.schema._def
            continue
        }
        if(DJSBuilderSymbol in obj)
            builder ??= obj[DJSBuilderSymbol]
        type ??= obj[DJSTypeSymbol] ?? obj.typeName
        if(type === 'ZodNumber' && obj.checks?.[0]?.kind === 'int'){
            type = 'integer'
        }
        break
    }
    return [ type!, builder, description ] as const
}

const builders: Record<string, (name: string, description: string | undefined, required: boolean, accessoryBuilder: any) => (builder: SlashCommandBuilder | SlashCommandSubcommandBuilder) => unknown> = {
    ZodString: (name, description, required, accessoryBuilder) => builder => builder.addStringOption(option => {
        option.setName(name)
        option.setRequired(required)
        accessoryBuilder?.(option)
        if(description)
            option.setDescription(description)
        return option
    }),
    ZodNumber: (name, description, required, accessoryBuilder) => builder => builder.addNumberOption(option => {
        option.setName(name)
        option.setRequired(required)
        accessoryBuilder?.(option)
        if(description)
            option.setDescription(description)
        return option
    }),
    ZodBoolean: (name, description, required, accessoryBuilder) => builder => builder.addBooleanOption(option => {
        option.setName(name)
        option.setRequired(required)
        accessoryBuilder?.(option)
        if(description)
            option.setDescription(description)
        return option
    }),
    integer: (name, description, required, accessoryBuilder) => builder => builder.addIntegerOption(option => {
        option.setName(name)
        option.setRequired(required)
        accessoryBuilder?.(option)
        if(description)
            option.setDescription(description)
        return option
    }),
    guild: () => () => {},
    role: (name, description, required, accessoryBuilder) => builder => builder.addRoleOption(option => {
        option.setName(name)
        option.setRequired(required)
        accessoryBuilder?.(option)
        if(description)
            option.setDescription(description)
        return option
    }),
    channel: (name, description, required, accessoryBuilder) => builder => builder.addChannelOption(option => {
        option.setName(name)
        option.setRequired(required)
        accessoryBuilder?.(option)
        if(description)
            option.setDescription(description)
        return option
    }),
}

const fetchers: Record<string, (name: string, required: boolean) => (interaction: ChatInputCommandInteraction) => unknown> = {
    ZodString: (name, required) => interaction => interaction.options.getString(name, required),
    ZodNumber: (name, required) => interaction => interaction.options.getNumber(name, required),
    ZodBoolean: (name, required) => interaction => interaction.options.getBoolean(name, required),
    integer: (name, required) => interaction => interaction.options.getInteger(name, required),
    guild: () => interaction => interaction.guild,
    role: (name, required) => interaction => interaction.options.getRole(name, required),
    channel: (name, required) => interaction => interaction.options.getChannel(name, required),
}

export function parseCommandOptions(object: z.AnyZodObject | undefined){
    if(!object)
        return []
    return Object.entries<z.ZodTypeAny>(object.shape).map(([ name, value ]) => {
        const required = !value.isNullable() && !value.isOptional()
        const [ type, accessoryBuilder, description ] = inspectType(value)
        return {
            name,
            builder: builders[type](name, description, required, accessoryBuilder),
            fetcher: fetchers[type](name, required)
        }
    })
}
