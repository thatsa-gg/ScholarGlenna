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
} from '@glenna/discord'
import {
    SlashCommandBuilder,
} from '@glenna/discord'
import { parseCommandOptions } from './_djs.js'
import { debug } from '../util/logging.js'

export type AutocompleteFn = (interaction: AutocompleteInteraction) => void | Promise<void>
export type MessageContextFn = (interaction: MessageContextMenuCommandInteraction) => void | Promise<void>
export type ChatCommandFn = (interaction: ChatInputCommandInteraction) => void | Promise<void>

export type BuilderFn<T> = (builder: T) => T

interface _Command {
    description: string
    command?: BuilderFn<SlashCommandBuilder>
    subcommand?: BuilderFn<SlashCommandSubcommandBuilder>
    chat?: ChatCommandFn
    message?: MessageContextFn
    autocomplete?: AutocompleteFn
}
export type Command<T extends Exclude<keyof _Command, 'description'> = 'chat'> = _Command & Required<Pick<_Command, T>>
export type TopCommand<T extends Exclude<keyof _Command, 'description'> = 'chat'> = Command<T> & { toJSON(name: string): RESTPostAPIApplicationCommandsJSONBody }

export function delegate(options: {
    description: string
    members: {
        [name: string]: Command<'chat' | 'subcommand'>
    }
}): TopCommand<'chat' | 'command'> {
    const entries = Object.entries(options.members)
    const members = new Map(entries)
    const hasAutocomplete = entries.findIndex(([, option ]) => typeof option.autocomplete !== 'undefined') >= 0
    debug(`COMMAND autocomplete: ${hasAutocomplete} -- ${options.description}`)
    return {
        description: options.description,
        command(builder){
            builder.setDescription(this.description)
            for(const [ key, value ] of members.entries())
                builder.addSubcommand(builder => value.subcommand(builder.setName(key)))
            return builder
        },
        toJSON(name){ return this.command(new SlashCommandBuilder().setName(name)).toJSON() },
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
            debug(`Received autocomplete interaction: ${interaction.commandName} ${subcommand}`)
            const target = members.get(subcommand)
            target?.autocomplete?.(interaction)
        } : undefined
    }
}

export function subcommand<TInput extends z.AnyZodObject>(options: {
    description: string
    input?: TInput,
    execute(options: z.infer<TInput>, interaction: ChatInputCommandInteraction): Promise<void | string | InteractionReplyOptions | MessagePayload>
    autocomplete?: (focused: AutocompleteFocusedOption, interaction: AutocompleteInteraction) => Promise<void | ApplicationCommandOptionChoiceData<string | number>[]>
}): Command<'chat' | 'subcommand'> {
    const inputs = parseCommandOptions(options.input)
    const autocomplete = options.autocomplete
    debug(`SUBCOMMAND autocomplete: ${!!autocomplete} -- ${options.description}`)
    return {
        description: options.description,
        subcommand(builder){
            builder.setDescription(this.description)
            for(const input of inputs)
                input.builder(builder)
            return builder
        },
        async chat(interaction): Promise<void> {
            const input = await options.input?.parseAsync(Object.fromEntries(inputs.map(({ name, fetcher }) => [ name, fetcher(interaction) ]))) ?? {}
            const result = await options.execute(input, interaction)
            if(typeof result !== 'undefined')
                await interaction.reply(result)
        },
        autocomplete: !autocomplete ? undefined : async interaction => {
            debug(`Received delegated autocomplete interaction: ${interaction.commandName}`)
            const focused = interaction.options.getFocused(true)
            const response = await autocomplete(focused, interaction)
            if(response)
                await interaction.respond(response)
        }
    }
}
