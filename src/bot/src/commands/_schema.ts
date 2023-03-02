import { z } from 'zod'
import {
    Awaitable,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandNumberOption,
    SlashCommandMentionableOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
    ApplicationCommandOptionAllowedChannelTypes,
    Guild,
    Role,
    GuildMember,
    ChannelType,
    TextChannel,
    VoiceChannel,
    CategoryChannel,
    ForumChannel,
    StageChannel,
    PrivateThreadChannel,
    PublicThreadChannel,
    NewsChannel,
    Channel,
    BaseChannel,
    AutocompleteInteraction
} from '@glenna/discord'
import type { Prisma, TeamMemberRole } from '@glenna/prisma'
import { database } from '../util/database.js'
import type { SlashSubcommandHelper } from './builders.js'
import type { SlashCommandHelper as IndexSlashCommandHelper } from './builders.js'

type AuthorizationRole = true | TeamMemberRole | [ TeamMemberRole, ...TeamMemberRole[] ]
type AuthorizationScope = { scope: 'guild' | 'team', role?: AuthorizationRole }
function isAuthorizationScope(candidate: undefined | AuthorizationRole | AuthorizationScope): candidate is AuthorizationScope {
    return candidate && typeof candidate === 'object' && !Array.isArray(candidate) || false
}
function authorizationAsFilter(candidate: undefined | AuthorizationRole | AuthorizationScope): Prisma.TeamMemberWhereInput['role'] {
    if(candidate === true)
        return undefined // allow any
    if(Array.isArray(candidate))
        return { in: candidate }
    if(!isAuthorizationScope(candidate))
        return candidate
    if(candidate.role === true)
        return undefined // allow any
    if(Array.isArray(candidate.role))
        return { in: candidate.role }
    return candidate.role
}

type OptionHandlerOptions =
    | SlashCommandAttachmentOption
    | SlashCommandBooleanOption
    | SlashCommandChannelOption
    | SlashCommandIntegerOption
    | SlashCommandMentionableOption
    | SlashCommandNumberOption
    | SlashCommandRoleOption
    | SlashCommandStringOption
    | SlashCommandUserOption
type OptionHandler<T extends OptionHandlerOptions = OptionHandlerOptions> = (option: T) => T
type OptionHandlers = {
    attachment: OptionHandler<SlashCommandAttachmentOption>
    boolean: OptionHandler<SlashCommandBooleanOption>
    channel: OptionHandler<SlashCommandChannelOption>
    integer: OptionHandler<SlashCommandIntegerOption>
    mentionable: OptionHandler<SlashCommandMentionableOption>
    number: OptionHandler<SlashCommandNumberOption>
    role: OptionHandler<SlashCommandRoleOption>
    string: OptionHandler<SlashCommandStringOption>
    user: OptionHandler<SlashCommandUserOption>
    guild: undefined
    member: undefined
}
type OptionType = keyof OptionHandlers
const fetchers: { [k in OptionType]: (name: string) => (required: boolean) => (interaction: ChatInputCommandInteraction) => unknown } = {
    attachment: name => required => interaction => interaction.options.getAttachment(name, required),
    boolean: name => required => interaction => interaction.options.getBoolean(name, required),
    string: name => required => interaction => interaction.options.getString(name, required),
    number: name => required => interaction => interaction.options.getNumber(name, required),
    channel: name => required => interaction => interaction.options.getChannel(name, required),
    integer: name => required => interaction => interaction.options.getInteger(name, required),
    mentionable: name => required => interaction => interaction.options.getMentionable(name, required),
    role: name => required => interaction => interaction.options.getRole(name, required),
    user: name => required => interaction => interaction.options.getUser(name, required),
    guild: () => required => ({ guild }) => {
        if(required && !guild)
            throw `No guild!`
        return guild
    },
    member: () => required => ({ member }) => {
        if(required && !member)
            throw `No member!`
        return member
    }
}
type OptionAppyFn<T, R = T> = (interaction: ChatInputCommandInteraction, result: T) => Promise<R>

const emptyObject = z.object({})
function findProperty(object: z.ZodTypeAny, name: string | symbol): string | undefined {
    let obj = object._def as any
    while(obj){
        if(name in obj)
            return obj[name] as string
        if('innerType' in obj)
            obj = obj.innerType?._def
        else
            obj = obj.schema?._def
    }
    return undefined
}

function getType(object: z.ZodTypeAny): [ OptionType, OptionHandler | undefined, OptionAppyFn<OptionType, any> ] {
    let obj = object._def as any
    let handler: OptionHandler | undefined = undefined
    let last: string | undefined = undefined
    let apply: OptionAppyFn<OptionType, any> = async (_, r) => r
    while(obj){
        if(!handler && djsHandlerSymbol in obj){
            handler = obj[djsHandlerSymbol] as OptionHandler
        }
        if(!apply && djsApplySymbol in obj){
            apply = obj[djsApplySymbol] as OptionAppyFn<OptionType, any>
        }
        if(djsTypeSymbol in obj){
            last = obj[djsTypeSymbol]
            break
        }
        if('typeName' in obj)
            last = obj.typeName as string
        if('innerType' in obj)
            obj = obj.innerType?._def
        else
            obj = obj.schema?._def
    }
    switch(last){
        case 'ZodString': return [ 'string', handler, apply ]
        case 'ZodNumber': return [ 'number', handler, apply ]
        case 'ZodBoolean': return [ 'boolean', handler, apply ]
        default:
            if(last && last in fetchers)
                return [ last as OptionType, handler, apply ]
            throw `Unrecognized type: ${last}`
    }
}

export class AuthorizationError extends Error {
    constructor(message: string){
        super(message)
    }
}

async function error(interaction: ChatInputCommandInteraction, content: string){
    await interaction.reply({
        ephemeral: true,
        content
    })
}

export type SlashCommandHelper = ReturnType<typeof slashCommand>
export function slashCommand<T extends z.AnyZodObject = typeof emptyObject>(props: {
    name: string
    description?: string
    input?: T
    authorized?: AuthorizationRole | AuthorizationScope
    execute: (data: z.output<T>, interaction: ChatInputCommandInteraction) => Awaitable<void>
}): SlashSubcommandHelper {
    const input = props.input ?? emptyObject
    const options = Object.entries<z.ZodTypeAny>(input.shape).map(([ name, value ]) => {
        const required = !value.isNullable() && !value.isOptional()
        const [ type, handler, apply ] = getType(value)
        return {
            name, type, required, handler, apply,
            description: findProperty(value, 'description'),
            fetch: fetchers[type](name)(required),
        }
    })
    return {
        name: props.name,
        builder(builder: SlashCommandSubcommandBuilder){
            if(props.description)
                builder.setDescription(props.description)
            else if(input.description)
                builder.setDescription(input.description)
            for(const { name, type, required, description, handler } of options){
                const optionBuilder = <T extends OptionHandlerOptions>(handler: OptionHandler | undefined) => (option: T) => {
                    option.setName(name)
                    option.setRequired(required)
                    if(description)
                        option.setDescription(description)
                    if(handler)
                        handler(option)
                    return option
                }
                switch(type){
                    case 'attachment':
                        builder.addAttachmentOption(optionBuilder(handler))
                        break
                    case 'boolean':
                        builder.addBooleanOption(optionBuilder(handler))
                        break
                    case 'number':
                    case 'integer':
                        builder.addNumberOption(optionBuilder(handler))
                        break
                    case 'string':
                        builder.addStringOption(optionBuilder(handler))
                        break
                    case 'channel':
                        builder.addChannelOption(optionBuilder(handler))
                        break
                    case 'mentionable':
                        builder.addMentionableOption(optionBuilder(handler))
                        break
                    case 'role':
                        builder.addRoleOption(optionBuilder(handler))
                        break
                    case 'user':
                        builder.addUserOption(optionBuilder(handler))
                        break
                    case 'guild':
                    case 'member':
                        // not pulled from options, skip when building
                        break
                }
            }
            return builder
        },
        async execute(interaction: ChatInputCommandInteraction){
            try {
                if(props.authorized){
                    if(!interaction.guild)
                        throw new AuthorizationError(`Unauthorized: not in a guild!`)
                    if(!interaction.member)
                        throw new AuthorizationError(`Unauthorized: not a user!`)
                    const guild = BigInt(interaction.guild.id)
                    const member = BigInt(interaction.member.user.id)
                    if(!isAuthorizationScope(props.authorized) || props.authorized.scope === 'guild'){
                        if(!database.isAuthorized(guild, member, authorizationAsFilter(props.authorized))){
                            throw new AuthorizationError(`Unauthorized!`)
                        }
                    }
                    // TODO: team authorization
                }
                const data = input.parse(Object.fromEntries(await Promise.all(options.map(async ({ name, fetch, apply }) => [ name, await apply(interaction, fetch(interaction) as any) ]))))
                props.execute(data, interaction)
            } catch(e){
                // TODO: log error
                if(e instanceof AuthorizationError){
                    await interaction.reply({
                        ephemeral: true,
                        content: e.message
                    })
                }

                await error(interaction, `Unknown error.`) // TODO: better error message
            }
        }
    }
}

export type SlashCommandGroup = ReturnType<typeof slashCommandGroup>
export function slashCommandGroup(options: {
    name: string
    description?: string
    builder?: (a: SlashCommandBuilder) => SlashCommandBuilder
    children: SlashCommandHelper[]
}): IndexSlashCommandHelper {
    const builder = new SlashCommandBuilder().setName(options.name)
    if(options.description)
        builder.setDescription(options.description)
    options.builder?.(builder)
    const children = new Map<string, SlashCommandHelper>(options.children.map(command => [ command.name, command ]))
    return {
        name: options.name,
        toJSON(){ return builder.toJSON() },
        async execute(interaction: ChatInputCommandInteraction){
            const subcommand = interaction.options.getSubcommand()
            if(!subcommand)
                return await error(interaction, "Unrecognized subcommand.")
            const target = children.get(subcommand)
            if(!target)
                return await error(interaction, "Unrecognized subcommand.")
            await target.execute(interaction)
        },
        async autocomplete(interaction: AutocompleteInteraction){
            const subcommand = interaction.options.getSubcommand()
            if(!subcommand)
                return
            children.get(subcommand)?.autocomplete?.(interaction)
        }
    }
}

const djsHandlerSymbol = Symbol('djs-handler')
const djsTypeSymbol = Symbol('djs-type')
const djsApplySymbol = Symbol('djs-apply')
function extend<T extends object, E>(obj: T, props: E & ThisType<T & E>){
    return Object.assign(obj, props) as T & E
}
function tag<T extends z.ZodTypeAny, O extends OptionType>(a: T, type: O, handler?: OptionHandlers[O]): T {
    a._def[djsTypeSymbol] = type
    if(handler)
        a._def[djsHandlerSymbol] = handler
    return a
}

type MaybeArray<T> = T | [T, ...T[]]
type RealChannel<T extends ApplicationCommandOptionAllowedChannelTypes> =
    T extends ChannelType.GuildText ? TextChannel
    : T extends ChannelType.GuildVoice ? VoiceChannel
    : T extends ChannelType.GuildCategory ? CategoryChannel
    : T extends ChannelType.GuildAnnouncement ? NewsChannel
    : T extends ChannelType.AnnouncementThread ? PublicThreadChannel & { type: ChannelType.AnnouncementThread }
    : T extends ChannelType.PublicThread ? PublicThreadChannel
    : T extends ChannelType.PrivateThread ? PrivateThreadChannel
    : T extends ChannelType.GuildStageVoice ? StageChannel
    : T extends ChannelType.GuildForum ? ForumChannel
    : Channel
export namespace djs {
    export const guild = () => tag(z.unknown(), 'guild').refine<Guild>((a): a is Guild => a instanceof Guild)
    export const member = () => tag(z.unknown(), 'member').refine<GuildMember>((a): a is GuildMember => a instanceof GuildMember)
    export const channel = <TChannel extends ApplicationCommandOptionAllowedChannelTypes>(options?: { type: MaybeArray<TChannel> }) =>
        tag(z.unknown(), 'channel', option => {
            if(options?.type){
                if(Array.isArray(options.type))
                    option.addChannelTypes(...options.type)
                else
                    option.addChannelTypes(options.type)
            }
            return option
        })
        .refine((a): a is BaseChannel => a instanceof BaseChannel)
        .refine((a): a is RealChannel<TChannel> => {
            if(!options?.type)
                return true
            if(Array.isArray(options.type))
                return options.type.includes(a.type as TChannel)
            return options.type === a.type
        })
    export const role = () => extend(tag(z.unknown(), 'role').refine<Role>((a): a is Role => a instanceof Role), {
        fetch(){
            (this._def as unknown as {[djsApplySymbol]: OptionAppyFn<Role>})[djsApplySymbol] = async (interaction, role) => {
                await interaction.guild!.members.fetch()
                const real = await interaction.guild!.roles.fetch(role.id)
                if(!real)
                    throw new Error() // TODO
                return real
            }
            return this
        }
    })
}
