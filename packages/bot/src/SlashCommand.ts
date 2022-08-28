import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9'
import type { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'

export class SlashCommand {
    data: { name: string, toJSON(): RESTPostAPIApplicationCommandsJSONBody }
    execute: (interaction: ChatInputCommandInteraction) => void | Promise<void>
    constructor(args: Required<SlashCommand>){
        this.data = args.data
        this.execute = args.execute
    }
}

export class SlashSubcommand {
    name: string
    builder: (builder: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder
    execute: (interaction: ChatInputCommandInteraction) => void | Promise<void>
    constructor(args: Required<SlashSubcommand>){
        this.name = args.name
        this.builder = args.builder
        this.execute = args.execute
    }
}
