import {
    REST,
    Routes,
    type RESTPostAPIApplicationCommandsJSONBody,
} from '@glenna/discord'
import type {
    TopCommand,
} from './_chat-command.js'

import { team } from './team/index.js'
import { glenna } from './glenna/index.js'
import { division } from './division/index.js'
import { error } from '../util/logging.js'

export const Commands = new Map<string, TopCommand>(Object.entries({
    team,
    glenna,
    division
}))

let client: REST | null = null
const CommandList: RESTPostAPIApplicationCommandsJSONBody[] = []
for(const [ name, command ] of Commands){
    try {
        CommandList.push(command.toJSON(name))
    } catch(e){
        error(`Failed to load command data for ${name}`)
        throw e
    }
}
export async function registerCommands(args: {
    token: string
    clientId: string
    guildId: string
}): Promise<void> {
    if(null === client){
        client = new REST({ version: '10' }).setToken(args.token)
    }
    await client.put(Routes.applicationGuildCommands(args.clientId, args.guildId), { body: CommandList })
}