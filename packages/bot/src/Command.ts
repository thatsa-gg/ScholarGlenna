import {
    Collection,
    Routes,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    type RESTPostAPIApplicationCommandsJSONBody,
    type SlashCommandSubcommandBuilder,
    type UserContextMenuCommandInteraction
} from 'discord.js'
import { load } from '@glenna/util'
import { REST } from '@discordjs/rest'

export interface Command {
    data: { name: string, toJSON(): RESTPostAPIApplicationCommandsJSONBody }
}

export interface CommandHandler<T> {
    execute(interaction: T): void | Promise<void>
}

export interface AutocompletionHandler {
    autocomplete(interaction: AutocompleteInteraction): Promise<void>
}

export function isAutocompleteHandler(candidate: any): candidate is AutocompletionHandler {
    return 'autocomplete' in candidate && typeof candidate.autocomplete === 'function'
}

export class SlashCommand implements Command, CommandHandler<ChatInputCommandInteraction> {
    data: { name: string, toJSON(): RESTPostAPIApplicationCommandsJSONBody }
    execute: (interaction: ChatInputCommandInteraction) => void | Promise<void>
    constructor(args: Required<SlashCommand>){
        this.execute = args.execute
        this.data = args.data
    }
}

export class SlashSubcommand implements CommandHandler<ChatInputCommandInteraction> {
    name: string
    builder: (builder: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder
    execute: (interaction: ChatInputCommandInteraction) => void | Promise<void>
    constructor(args: Required<SlashSubcommand>){
        this.name = args.name
        this.builder = args.builder
        this.execute = args.execute
    }
}

export class UserCommand implements Command, CommandHandler<UserContextMenuCommandInteraction> {
    data: { name: string, toJSON(): RESTPostAPIApplicationCommandsJSONBody }
    execute: (interaction: UserContextMenuCommandInteraction) => void | Promise<void>
    constructor(args: Required<UserCommand>){
        this.data = args.data
        this.execute = args.execute
    }
}

export const ChatCommands = new Collection<string, SlashCommand>()
export const UserCommands = new Collection<string, UserCommand>()
export const AutocompleteCommands = new Collection<string, AutocompletionHandler>()

interface RegistrationArgs {
    token: string,
    clientId: string,
    guildId: bigint
}
let client: REST | null = null
const CommandList: RESTPostAPIApplicationCommandsJSONBody[] = []
export async function registerCommands(args: RegistrationArgs): Promise<void> {
    if(null === client){
        client = new REST({ version: '10' }).setToken(args.token)
        for(const command of await load<Command>(import.meta, './commands')){
            CommandList.push(command.data.toJSON())
            if(isAutocompleteHandler(command))
                AutocompleteCommands.set(command.data.name, command)
            if(command instanceof SlashCommand)
                ChatCommands.set(command.data.name, command)
            else if(command instanceof UserCommand)
                UserCommands.set(command.data.name, command)
        }
    }
    await client.put(
        Routes.applicationGuildCommands(args.clientId, args.guildId.toString()),
        { body: CommandList })
}
