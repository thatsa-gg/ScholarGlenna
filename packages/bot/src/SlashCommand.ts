import type { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import type { CommandInteraction } from "discord.js";

export class SlashCommand {
    data: { name: string, toJSON(): RESTPostAPIApplicationCommandsJSONBody }
    execute: (interaction: CommandInteraction) => void | Promise<void>
    constructor(args: Required<SlashCommand>){
        this.data = args.data
        this.execute = args.execute
    }
}

export class SlashSubcommand {
    name: string
    builder: (builder: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder
    execute: (interaction: CommandInteraction) => void | Promise<void>
    constructor(args: Required<SlashSubcommand>){
        this.name = args.name
        this.builder = args.builder
        this.execute = args.execute
    }
}
