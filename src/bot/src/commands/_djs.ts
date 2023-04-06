import {
    type ApplicationCommandOptionAllowedChannelTypes,
    type PrivateThreadChannel,
    type PublicThreadChannel,
    CategoryChannel,
    ChannelType,
    ChatInputCommandInteraction,
    ForumChannel,
    GuildMember,
    NewsChannel,
    SlashCommandBuilder,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandNumberOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    StageChannel,
    TextChannel,
    VoiceChannel
} from '@glenna/discord'
import {
    Role,
    Guild,
    User,
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
    ;(handler._def as any)[DJSTypeSymbol] = type
    return handler
}

export namespace djs {
    export function channel<T extends ApplicationCommandOptionAllowedChannelTypes>(channelTypes?: T[]){
        const handler = custom<RealChannelType<T>>('channel', candidate =>
            candidate instanceof BaseChannel
            && ((channelTypes as ChannelType[] | undefined)?.includes(candidate.type) ?? true))
        ;(handler._def as any)[DJSBuilderSymbol] = (builder: SlashCommandChannelOption) => channelTypes ? builder.addChannelTypes(...channelTypes) : builder
        return handler
    }

    export function role(){
        return custom<Role>('role', candidate => candidate instanceof Role)
    }

    export function guild(){
        return custom<Guild>('guild', candidate => candidate instanceof Guild)
    }

    export function user(){
        return custom<User>('user', candidate => candidate instanceof User)
    }

    export function actor(){
        return custom<GuildMember>('actor', candidate => candidate instanceof GuildMember)
    }

    export function string(builder: (option: SlashCommandStringOption) => SlashCommandStringOption){
        const handler = z.string()
        ;(handler._def as any)[DJSBuilderSymbol] = builder
        return handler
    }

    export function number(min: number, max: number){
        const handler = z.number().min(min).max(max)
        ;(handler._def as any)[DJSBuilderSymbol] = (option: SlashCommandNumberOption) => option.setMinValue(min).setMaxValue(max)
        return handler
    }

    export function index(){
        const handler = z.number().int().min(0)
        ;(handler._def as any)[DJSBuilderSymbol] = (option: SlashCommandIntegerOption) => option.setMinValue(0).setAutocomplete(true)
        return handler
    }
}

function inspectType(zodType: z.ZodTypeAny){
    let obj = zodType._def
    let type: string
    let description: string | undefined = undefined
    let builder: any
    while(obj){
        if('description' in obj){
            description ??= obj.description
        }
        if(DJSBuilderSymbol in obj){
            builder ??= obj[DJSBuilderSymbol]
        }

        // custom can inject the type symbol on a ZodEffects object
        // if there's a transformer, so we'll step through one layer
        // at a time instead of .schema|innerType._def in one go.
        if(DJSTypeSymbol in obj){
            type = obj[DJSTypeSymbol]
            break
        }
        if('_def' in obj){
            obj = obj._def
            continue
        }
        if('schema' in obj){
            obj = obj.schema
            continue
        }

        // .innerType can be a function alongside ._def, so prefer ._def
        if('innerType' in obj){
            obj = obj.innerType
            continue
        }

        type ChoicesBuilder = SlashCommandStringOption | SlashCommandIntegerOption | SlashCommandNumberOption
        // At this point, we should have reached the bottom of the tree
        type = obj.typeName
        if(type === 'ZodNumber' && obj.checks?.[0]?.kind === 'int'){
            type = 'integer'
        } else if(type === 'ZodEnum'){
            type = typeof obj.values[0] === 'string' ? 'ZodString'
                : typeof obj.values[0] === 'number' ? (Number.isInteger(obj.values[0]) ? 'integer' : 'ZodNumber')
                : (() => { throw `Illegal ZodEnum type ${typeof obj.values[0]}` })()
            const otherBuilder = builder
            builder = otherBuilder
                ? (option: ChoicesBuilder) => { option.addChoices(...obj.values.map((a: any) => ({ name: a.toString(), value: a }))); return otherBuilder(option) }
                : (option: ChoicesBuilder) => { option.addChoices(...obj.values.map((a: any) => ({ name: a.toString(), value: a }))); return option }
        } else if(type === 'ZodNativeEnum'){
            const entries = Object.entries(obj.values)
            const legalEntries = entries.filter(([key]) => !/^\d+$/.test(key))
            const otherBuilder = builder
            if(typeof legalEntries[0]?.[1] === 'string'){
                type = 'ZodString'
                if(legalEntries.length !== entries.length)
                    throw `String NativeEnum must have only string keys (${legalEntries.length} != ${entries.length}).`
                if(legalEntries.findIndex(([, value]) => typeof value !== 'string') > -1)
                    throw `String NativeEnum must have only string values (${JSON.stringify(Object.fromEntries(legalEntries))}).`
                builder = otherBuilder
                    ? (option: SlashCommandStringOption) => { option.addChoices(...legalEntries.map(([name, value]) => ({ name, value: value as string }))); return otherBuilder(option) }
                    : (option: SlashCommandStringOption) => { option.addChoices(...legalEntries.map(([name, value]) => ({ name, value: value as string }))); return option }
            } else {
                type = 'integer'
                if(legalEntries.length !== entries.length && legalEntries.length * 2 !== entries.length)
                    throw `Number NativeEnum must have either only string keys, or only number values (${legalEntries.length} !~= ${entries.length}).`
                if(legalEntries.findIndex(([, value]) => !Number.isInteger(value)) > -1)
                    throw `Number NativeEnum must have only integer values (${JSON.stringify(Object.fromEntries(legalEntries))}).`
                builder = otherBuilder
                    ? (option: SlashCommandIntegerOption) => { option.addChoices(...legalEntries.map(([name, value]) => ({ name, value: value as number }))); return otherBuilder(option) }
                    : (option: SlashCommandIntegerOption) => { option.addChoices(...legalEntries.map(([name, value]) => ({ name, value: value as number }))); return option }
            }
        }
        if(type === 'ZodNumber' || type === 'integer'){
            type MinMaxCheck = { kind: 'min' | 'max', value: number, inclusive: boolean }
            const min = obj.checks?.find((check: MinMaxCheck) => check.kind === 'min')
            const builder1 = builder
            if(min){
                if(!min.inclusive)
                    throw `Minimum values must be inclusive.`
                builder = builder1
                    ? (option: SlashCommandNumberOption | SlashCommandIntegerOption) => { option.setMinValue(min.value); return builder1(option) }
                    : (option: SlashCommandNumberOption | SlashCommandIntegerOption) => { option.setMinValue(min.value); return option }
            }
            const max = obj.checks?.find((check: MinMaxCheck) => check.kind === 'max')
            const builder2 = builder
            if(max){
                if(!max.inclusive)
                    throw `Maximum values must be inclusive.`
                builder = builder2
                    ? (option: SlashCommandNumberOption | SlashCommandIntegerOption) => { option.setMaxValue(max.value); return builder2(option) }
                    : (option: SlashCommandNumberOption | SlashCommandIntegerOption) => { option.setMaxValue(max.value); return option }
            }
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
    actor: () => () => {},
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
    user: (name, description, required, accessoryBuilder) => builder => builder.addUserOption(option => {
        option.setName(name)
        option.setRequired(required)
        accessoryBuilder?.(option)
        if(description)
            option.setDescription(description)
        return option
    }),
    mentionable: (name, description, required, accessoryBuilder) => builder => builder.addMentionableOption(option => {
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
    actor: () => interaction => {
        if(interaction.member)
            return interaction.member
        throw `Cannot find actor guild member.`
    },
    role: (name, required) => interaction => interaction.options.getRole(name, required),
    channel: (name, required) => interaction => interaction.options.getChannel(name, required),
    user: (name, required) => interaction => interaction.options.getUser(name, required),
    mentionable: (name, required) => interaction => interaction.options.getMentionable(name, required),
}

export function parseCommandOptions(object: z.AnyZodObject | undefined){
    if(!object)
        return []
    return Object.entries<z.ZodTypeAny>(object.shape).map(([ name, value ]) => {
        const required = !value.isNullable() && !value.isOptional()
        const [ type, accessoryBuilder, description ] = inspectType(value)
        const builder = builders[type]
        const fetcher = fetchers[type]
        if(!builder)
            throw `Could not find builder for type ${type}`
        if(!fetcher)
            throw `Could not find fetcher for type ${type}`
        return {
            name,
            builder: builder(name, description, required, accessoryBuilder),
            fetcher: fetcher(name, required)
        }
    })
}
