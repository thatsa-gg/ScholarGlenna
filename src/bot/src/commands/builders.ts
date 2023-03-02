import {
    type AutocompleteInteraction,
    type Awaitable,
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder
} from "@glenna/discord"

type ChatCommandHandler = (interaction: ChatInputCommandInteraction) => Awaitable<void>
type ChatAutocompleteHandler = (interaction: AutocompleteInteraction) => Promise<void>
export type SlashCommandHelper = ReturnType<typeof slashCommand> | ReturnType<typeof slashCommandChildren>

async function error(interaction: ChatInputCommandInteraction){
    await interaction.reply({
        ephemeral: true,
        content: "Unrecognized subcommand."
    })
}

export function slashCommand(name: string, args: {
    description?: string
    data?: (a: SlashCommandBuilder) => SlashCommandBuilder
    execute: ChatCommandHandler
    autocomplete?: ChatAutocompleteHandler
}){
    let builder = new SlashCommandBuilder().setName(name)
    if(args.description)
        builder = builder.setDescription(args.description)
    if(args.data)
        builder = args.data(builder)
    return {
        name, toJSON(){ return builder.toJSON() },
        execute: args.execute,
        autocomplete: args.autocomplete,
    }
}

type SlashSubcommandChild = {
    execute: ChatCommandHandler
    autocomplete?: ChatAutocompleteHandler
}

export function slashCommandChildren(name: string, args: {
    description?: string
    data?: (a: SlashCommandBuilder) => SlashCommandBuilder
    children: {
        [name: string]: SlashSubcommandHelper
    }
}){
    let builder = new SlashCommandBuilder().setName(name)
    if(args.description)
        builder = builder.setDescription(args.description)
    if(args.data)
        builder = args.data(builder)
    const children = new Map<string, SlashSubcommandChild>()
    for(const [ name, child ] of Object.entries(args.children)){
        children.set(name, child)
        builder.addSubcommand(builder => (child.builder ?? (a => a))(builder).setName(name))
    }
    return {
        name, toJSON(){ return builder.toJSON() },
        async execute(interaction: ChatInputCommandInteraction): Promise<void> {
            const subcommand = interaction.options.getSubcommand()
            if(!subcommand)
                return await error(interaction)
            const target = children.get(subcommand)
            if(!target)
                return await error(interaction)
            await target.execute(interaction)
        },
        async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
            const subcommand = interaction.options.getSubcommand()
            if(!subcommand)
                return
            children.get(subcommand)?.autocomplete?.(interaction)
        }
    }
}

type SlashSubcommandArgs = SlashSubcommandChild & {
    builder(builder: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
}
export type SlashSubcommandHelper = ReturnType<typeof slashSubcommand>
export function slashSubcommand(name: string, args: SlashSubcommandArgs){
    return { name, ...args }
}
