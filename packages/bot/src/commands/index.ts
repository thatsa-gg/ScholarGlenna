import {
    REST,
    Routes,
    type RESTPostAPIApplicationCommandsJSONBody
} from 'discord.js'
import type { SlashCommandHelper } from './builders.js'

export {
    slashCommand,
    slashCommandChildren,
    slashSubcommand,
    SlashSubcommandHelper,
    SlashCommandHelper
} from './builders.js'

// commands
import { teamCommand } from './team/index.js'
import { glennaCommand } from './glenna/index.js'

export const ChatCommands = new Map<string, SlashCommandHelper>()
ChatCommands.set(teamCommand.name, teamCommand)
ChatCommands.set(glennaCommand.name, glennaCommand)

let client: REST | null = null
const commandList: RESTPostAPIApplicationCommandsJSONBody[] = []
export async function registercommands(args: {
    token: string,
    clientId: string,
    guildId: string
}): Promise<void> {
    if(null === client){
        client = new REST({ version: '10' }).setToken(args.token)
        for(const command of ChatCommands.values())
            commandList.push(command.toJSON())
    }
    await client.put(Routes.applicationGuildCommands(args.clientId, args.guildId), { body: commandList })
}
