import { Collection } from "discord.js"
import type { SlashCommand } from "./SlashCommand.js"
import { REST as RESTClient } from '@discordjs/rest'
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v9'
import { load } from '@glenna/util'

export const Commands = new Collection<string, SlashCommand>()
const CommandList: RESTPostAPIApplicationCommandsJSONBody[] = []
for(const command of await load<SlashCommand>(import.meta, './commands')){
    Commands.set(command.data.name, command)
    CommandList.push(command.data.toJSON())
}
const REST_VERSION = '9'
const REST = new RESTClient({ version: REST_VERSION })
interface RegistrationArgs {
    token: string,
    clientId: string,
    guildId: bigint
}
export async function registerCommands(args: RegistrationArgs): Promise<void> {
    const { token, clientId, guildId } = args
    REST.setToken(token)
    await REST.put(
        Routes.applicationGuildCommands(clientId, guildId.toString()),
        { body: CommandList })
}
