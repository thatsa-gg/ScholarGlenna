import {
    REST,
    Routes,
    type RESTPostAPIApplicationCommandsJSONBody,
} from '@glenna/discord'
import type {
    TopCommand,
} from './_command.js'

import { team } from './team/index.js'
import { glenna } from './glenna/index.js'
import { division } from './division/index.js'
import { error } from '../util/logging.js'

import { teamMemberAdd } from './_user-context/team-member-add.js'
import { teamMemberRemove } from './_user-context/team-member-remove.js'

import { importLogs } from './_message-context/import-logs.js'

export const Commands = new Map<string, TopCommand>(Object.entries({
    // Chat Slash Commands
    team,
    glenna,
    division,

    // User Context Commands
    'Add Team Member': teamMemberAdd,
    'Remove Team Member': teamMemberRemove,

    // Message Context Commands
    'Import Logs': importLogs,
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
