import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageContextMenuCommandInteraction,
    REST,
    RESTPostAPIApplicationCommandsJSONBody,
    Routes,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder
} from '@glenna/discord'

export type AutocompleteFn = (interaction: AutocompleteInteraction) => void | Promise<void>
export type MessageContextFn = (interaction: MessageContextMenuCommandInteraction) => void | Promise<void>
export type ChatCommandFn = (interaction: ChatInputCommandInteraction) => void | Promise<void>
export type BuilderFn<T> = (builder: T) => T

interface _Command {
    description: string
    command?: BuilderFn<SlashCommandBuilder>
    subcommand?: BuilderFn<SlashCommandSubcommandBuilder>
    chat?: ChatCommandFn
}
export type Command<T extends Exclude<keyof _Command, 'name' | 'description'> = 'chat'> = _Command & Required<Pick<_Command, T>>

import { team } from './team/index.js'
import { glenna } from './glenna/index.js'

export const ChatCommands = new Map<string, ChatCommandFn>(Object.entries({
    team: team.chat,
    glenna: glenna.chat,
}))
export const AutocompleteCommands = new Map<string, AutocompleteFn>(Object.entries({

}))
export const MessageContextCommands = new Map<string, MessageContextFn>(Object.entries({

}))

let client: REST | null = null
const CommandList: RESTPostAPIApplicationCommandsJSONBody[] = []
export async function registerCommands(args: {
    token: string
    clientId: string
    guildId: string
}): Promise<void> {
    if(null === client){
        client = new REST({ version: '10' }).setToken(args.token)
        CommandList.push(...[
            team.command(new SlashCommandBuilder()).toJSON(),
            glenna.command(new SlashCommandBuilder()).toJSON(),
        ])
    }
    await client.put(Routes.applicationGuildCommands(args.clientId, args.guildId), { body: CommandList })
}
