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
    VoiceChannel,
    type AutocompleteFocusedOption,
    type AutocompleteInteraction,
} from '@glenna/discord'
import {
    Role,
    Guild,
    User,
    BaseChannel
} from '@glenna/discord'
import { z } from 'zod'
//import { database } from '../util/database.js'
import { isTeamAuthorization, type Authorization, asArray } from './_authorization.js'
import { database } from '../util/database.js'

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
const DJSAutocompleteSymbol = Symbol('djs-autocomplete')

export type AutocompleteBuilderFn = (propertyName: string) => (
    option: AutocompleteFocusedOption,
    interaction: AutocompleteInteraction,
    authorization?: Authorization<string>
) => Promise<{ name: string, value: string | number }[] | void>
function extend<T extends z.ZodTypeAny>(object: T, options: {
    type?: string
    builder?: ((b: any) => any) | null
    autocomplete?: AutocompleteBuilderFn
}){
    const target = object._def as {
        [DJSTypeSymbol]?: string
        [DJSBuilderSymbol]?: Function
        [DJSAutocompleteSymbol]?: Function
    }
    if('type' in options)
        target[DJSTypeSymbol] = options.type
    if('builder' in options && null !== options.builder)
        target[DJSBuilderSymbol] = options.builder
    if('autocomplete' in options)
        target[DJSAutocompleteSymbol] = options.autocomplete
    return object
}
function custom<T>(type: string, ...params: Parameters<typeof z.custom<T>>){
    return extend(z.custom<T>(...params), {
        type
    })
}

export namespace djs {
    export function channel<T extends ApplicationCommandOptionAllowedChannelTypes>(channelTypes?: T[]){
        const guard = (c: any): c is RealChannelType<T> => c instanceof BaseChannel && ((channelTypes as ChannelType[] | undefined)?.includes(c.type) ?? true)
        return extend(z.custom(guard), {
            type: 'channel',
            builder: channelTypes
                ? (builder: SlashCommandChannelOption) => builder.addChannelTypes(...channelTypes)
                : null
        })
    }

    export const role = () => custom<Role>('role', c => c instanceof Role)
    export const guild = () => custom<Guild>('guild', c => c instanceof Guild)
    export const user = () => custom<User>('user', c => c instanceof User)
    export const actor = () => custom<GuildMember>('actor', c => c instanceof GuildMember)
    export const string = () => extend(z.string(), {
        builder(builder: SlashCommandStringOption){
            return builder.setAutocomplete(true)
        }
    })
    export const number = (min: number, max: number) => extend(z.number().min(min).max(max), {
        builder(builder: SlashCommandNumberOption){
            return builder.setMinValue(min).setMaxValue(max)
        }
    })
    export const index = () => extend(z.number().int().min(0), {
        builder(builder: SlashCommandIntegerOption){
            return builder.setMinValue(0).setAutocomplete(true)
        }
    })

    export function team(){
        return extend(djs.string().regex(/^\d+$/).transform(a => BigInt(a)), {
            autocomplete(property){
                return async ({ name, value }, interaction, authorization) => {
                    if(name !== property)
                        return
                    return await database.team.autocompleteSnowflake(interaction, value, isTeamAuthorization(authorization)
                        ? asArray(authorization.team)
                        : [ 'read' ])
                }
            }
        })
    }

    export function autocomplete<T extends z.ZodTypeAny>(object: T, options: { autocomplete: AutocompleteBuilderFn }){
        return extend(object, options)
    }
}

function inspectType(zodType: z.ZodTypeAny){
    let obj = zodType._def
    let type: string
    let description: string | undefined = undefined
    let builder: any
    let autocomplete: AutocompleteBuilderFn | undefined = undefined
    while(obj){
        if('description' in obj){
            description ??= obj.description
        }
        if(DJSBuilderSymbol in obj){
            builder ??= obj[DJSBuilderSymbol]
        }
        if(DJSAutocompleteSymbol in obj){
            autocomplete ??= obj[DJSAutocompleteSymbol] as AutocompleteBuilderFn
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
    return [ type!, builder, description, autocomplete ] as const
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
        const [ type, accessoryBuilder, description, autocomplete ] = inspectType(value)
        const builder = builders[type]
        const fetcher = fetchers[type]
        if(!builder)
            throw `Could not find builder for type ${type}`
        if(!fetcher)
            throw `Could not find fetcher for type ${type}`
        return {
            name,
            builder: builder(name, description, required, accessoryBuilder),
            fetcher: fetcher(name, required),
            autocomplete: autocomplete?.(name)
        }
    })
}
