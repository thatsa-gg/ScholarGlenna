import type { z } from 'zod'
import type {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    InteractionReplyOptions,
    MessageContextMenuCommandInteraction,
    MessagePayload,
    RESTPostAPIApplicationCommandsJSONBody,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    UserContextMenuCommandInteraction,
    Guild,
    Message,
} from '@glenna/discord'
import {
    ApplicationCommandType,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    GuildMember,
} from '@glenna/discord'
import { parseCommandOptions } from './_djs.js'
import { PublicError } from '../PublicError.js'

export type AutocompleteFn = (interaction: AutocompleteInteraction) => void | Promise<void>
export type ChatCommandFn = (interaction: ChatInputCommandInteraction) => void | Promise<void>
export type MessageContextFn = (interaction: MessageContextMenuCommandInteraction) => void | Promise<void>
export type UserContextFn = (interaction: UserContextMenuCommandInteraction) => void | Promise<void>
export type AuthorizationFn = (member: any) => boolean | Promise<boolean>

export type BuilderFn<T> = (builder: T) => T

export interface _Command {
    command?: BuilderFn<SlashCommandBuilder>
    subcommand?: BuilderFn<SlashCommandSubcommandBuilder>
    group?: BuilderFn<SlashCommandSubcommandGroupBuilder>
    context?: BuilderFn<ContextMenuCommandBuilder>

    chat?: ChatCommandFn
    message?: MessageContextFn
    user?: UserContextFn
    autocomplete?: AutocompleteFn
}
type _CommandKeys = keyof _Command
export type Command<T extends _CommandKeys = 'chat'> = _Command & Required<Pick<_Command, T>>
export type TopCommand = _Command & { toJSON(name: string): RESTPostAPIApplicationCommandsJSONBody }

function isCommand<T extends _CommandKeys>(command: _Command, ...keys: T[]): command is Command<T> {
    for(const key of keys)
        if(typeof command[key] === 'undefined')
            return false
    return true
}

export function delegate(options: {
    description: string
    members: {
        [name: string]: Command<'chat' | 'subcommand'> | Command<'chat' | 'group'>
    }
}): Command<'chat' | 'command'> & TopCommand {
    const entries = Object.entries(options.members)
    const members = new Map(entries)
    const hasAutocomplete = entries.findIndex(([, option ]) => typeof option.autocomplete !== 'undefined') >= 0
    return {
        command(builder){
            builder.setDescription(options.description)
            for(const [ key, value ] of members.entries()){
                if(isCommand(value, 'subcommand'))
                    builder.addSubcommand(builder => value.subcommand(builder.setName(key)))
                else
                    builder.addSubcommandGroup(builder => value.group(builder.setName(key)))
            }
            return builder
        },
        toJSON(name){ return this.command(new SlashCommandBuilder().setName(name)).toJSON() },
        async chat(interaction){
            const memberName = interaction.options.getSubcommandGroup(false) ?? interaction.options.getSubcommand(true)
            const target = members.get(memberName)
            if(!target){
                await interaction.reply({
                    ephemeral: true,
                    content: `Unrecognized command!`
                })
                return
            }
            await target.chat(interaction)
        },
        autocomplete: hasAutocomplete ? async interaction => {
            const memberName = interaction.options.getSubcommandGroup(false) ?? interaction.options.getSubcommand(true)
            const target = members.get(memberName)
            await target?.autocomplete?.(interaction)
        } : undefined
    }
}

type BulkCommandOptions =
    | Command<'context' | 'user'>
    | Command<'context' | 'message'>

export function bulk(options: BulkCommandOptions[]): _Command {
    return {

    }
}

export function group(options: {
    description: string
    members: {
        [name: string]: Command<'chat' | 'subcommand'>
    }
}): Command<'chat' | 'group'> {
    const entries = Object.entries(options.members)
    const members = new Map(entries)
    const hasAutocomplete = entries.findIndex(([, option ]) => typeof option.autocomplete !== 'undefined') >= 0
    return {
        group(builder){
            builder.setDescription(options.description)
            for(const [ key, value ] of members.entries()){
                builder.addSubcommand(builder => value.subcommand(builder.setName(key)))
            }
            return builder
        },
        async chat(interaction){
            const subcommand = interaction.options.getSubcommand(true)
            const target = members.get(subcommand)
            if(!target){
                await interaction.reply({
                    ephemeral: true,
                    content: `Unrecognized command!`
                })
                return
            }
            await target.chat(interaction)
        },
        autocomplete: hasAutocomplete ? async interaction => {
            const subcommand = interaction.options.getSubcommand(true)
            const target = members.get(subcommand)
            await target?.autocomplete?.(interaction)
        } : undefined
    }
}

export function subcommand<TInput extends z.AnyZodObject>(options: {
    description: string
    input?: TInput,
    authorize?: (options: z.infer<TInput>, interaction: ChatInputCommandInteraction) => boolean | Promise<boolean>
    execute(options: z.infer<TInput>, interaction: ChatInputCommandInteraction): Promise<void | string | InteractionReplyOptions | MessagePayload>
    autocomplete?: (focused: AutocompleteFocusedOption, interaction: AutocompleteInteraction) => Promise<void | ApplicationCommandOptionChoiceData<string | number>[]>
}): Command<'chat' | 'subcommand'> {
    const inputs = parseCommandOptions(options.input)
    const autocomplete = options.autocomplete
    const authorize = options.authorize
    return {
        subcommand(builder){
            builder.setDescription(options.description)
            for(const input of inputs)
                input.builder(builder)
            return builder
        },
        async chat(interaction){
            const input = await options.input?.parseAsync(Object.fromEntries(inputs.map(({ name, fetcher }) => [ name, fetcher(interaction) ]))) ?? {}
            if(authorize && !await authorize(input, interaction))
                throw new PublicError("You are not authorized to run this command.")
            const result = await options.execute(input, interaction)
            if(typeof result !== 'undefined'){
                if(interaction.replied)
                    await interaction.editReply(result)
                else
                    await interaction.reply(result)
            }
        },
        autocomplete: !autocomplete ? undefined : async interaction => {
            const focused = interaction.options.getFocused(true)
            const response = await autocomplete(focused, interaction)
            if(response)
                await interaction.respond(response)
        }
    }
}

export function user(options: {
    authorize?: (actor: GuildMember, guild: Guild, target: GuildMember, interaction: UserContextMenuCommandInteraction) => boolean | Promise<boolean>
    execute(member: GuildMember, guild: Guild, interaction: UserContextMenuCommandInteraction): Promise<void | string | InteractionReplyOptions | MessagePayload>
}): Command<'user' | 'context'> & TopCommand {
    return {
        context(builder){
            builder.setType(ApplicationCommandType.User)
            return builder
        },
        toJSON(name){ return this.context(new ContextMenuCommandBuilder().setName(name)).toJSON() },
        async user(interaction){
            const { guild, targetMember, member: actorMember } = interaction
            if(!guild)
                throw `User context commands can only be invoked from a server.`
            if(!targetMember)
                throw `User context commands must target a valid guild member.`
            const member = targetMember instanceof GuildMember
                ? targetMember
                : await guild.members.fetch(targetMember.user.id)
            if(options.authorize){
                if(!actorMember)
                    throw `Interaction guild member was null!`
                const actor = actorMember instanceof GuildMember
                    ? actorMember
                    : await guild.members.fetch(actorMember.user.id)
                if(!await options.authorize(actor, guild, member, interaction))
                    throw new PublicError("You are not authorized to run this command.")
            }
            const result = await options.execute(member, guild, interaction)
            if(typeof result !== 'undefined'){
                if(interaction.replied)
                    await interaction.editReply(result)
                else
                    await interaction.reply(result)
            }
        }
    }
}

export function message(options: {
    authorize?: (actor: GuildMember, guild: Guild, message: Message, interaction: MessageContextMenuCommandInteraction) => boolean | Promise<boolean>
    execute(message: Message, guild: Guild, interaction: MessageContextMenuCommandInteraction): Promise<void | string | InteractionReplyOptions | MessagePayload>
}): Command<'message' | 'context'> & TopCommand {
    return {
        context(builder){
            builder.setType(ApplicationCommandType.Message)
            return builder
        },
        toJSON(name){ return this.context(new ContextMenuCommandBuilder().setName(name)).toJSON() },
        async message(interaction){
            const { guild, targetMessage, member } = interaction
            if(!guild)
                throw `User context commands can only be invoked from a server.`
            if(options.authorize){
                if(!member)
                    throw `Interaction guild member was null!`
                const actor = member instanceof GuildMember
                    ? member
                    : await guild.members.fetch(member.user.id)
                if(!await options.authorize(actor, guild, targetMessage, interaction))
                    throw new PublicError("You are not authorized to run this command.")
            }
            const result = await options.execute(targetMessage, guild, interaction)
            if(typeof result !== 'undefined'){
                if(interaction.replied)
                    await interaction.editReply(result)
                else
                    await interaction.reply(result)
            }
        }
    }
}
