import {
    ChatInputCommandInteraction,
    MessageContextMenuCommandInteraction,
    REST,
    Routes,
    type RESTPostAPIApplicationCommandsJSONBody
} from '@glenna/discord'
import type { SlashCommandHelper } from './builders.js'

export {
    slashCommand,
    slashCommandChildren,
    slashSubcommand,
    SlashSubcommandHelper,
    SlashCommandHelper
} from './builders.js'

import type { MessageCommandHelper } from './message-builders.js'
export {
    MessageCommandHelper
} from './message-builders.js'

// commands
import { teamCommand } from './team/index.js'
import { glennaCommand } from './glenna/index.js'

export const ChatCommands: Map<string, SlashCommandHelper> = new Map<string, SlashCommandHelper>()
ChatCommands.set(teamCommand.name, teamCommand)
ChatCommands.set(glennaCommand.name, glennaCommand)

// message commands
import { messageSubmitLogs } from './_message/submit-logs.js'

export const MessageCommands: Map<string, MessageCommandHelper> = new Map<string, MessageCommandHelper>()
//MessageCommands.set(messageSubmitLogs.name, messageSubmitLogs)

let client: REST | null = null
const commandList: RESTPostAPIApplicationCommandsJSONBody[] = []
export async function registerCommands(args: {
    token: string,
    clientId: string,
    guildId: string
}): Promise<void> {
    if(null === client){
        client = new REST({ version: '10' }).setToken(args.token)
        for(const command of ChatCommands.values())
            commandList.push(command.toJSON())
        for(const command of MessageCommands.values())
            commandList.push(command.toJSON())
    }
    await client.put(Routes.applicationGuildCommands(args.clientId, args.guildId), { body: commandList })
}

export async function getGuildAndUser(interaction: ChatInputCommandInteraction | MessageContextMenuCommandInteraction){
    const sourceGuild = interaction.guild
    if(!sourceGuild){
        await interaction.reply({
            ephemeral: true,
            content: `This command must be executed in a guild.`
        })
        return
    }

    const sourceUser = interaction.member
    if(!sourceUser){
        await interaction.reply({
            ephemeral: true,
            content: `Somehow, you don't exist in the Discord API.`
        })
        return
    }

    return [ sourceGuild, sourceUser ] as const
}
