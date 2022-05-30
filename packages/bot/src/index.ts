/*
 * Glenna, Raid Helper
 */

import { log, info, error } from 'console'
import { DISCORD_TOKEN, OAUTH_CLIENT_ID, VERSION } from '@glenna/common'

import { Client, Intents } from 'discord.js'
import { updateStatus } from './status'
import { resolve, start } from '@glenna/util'
import { Commands, registerCommands } from './commands'

export const Glenna: Client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
    ]
})
Glenna.on('ready', async() => {
    log('Beginning startup...')
    Glenna.setMaxListeners(0)
    Glenna.user!.setActivity(`Starting up v.${VERSION}...`)
    await Glenna.user!.setUsername('ScholarGlenna')
    await Glenna.user!.setAvatar(resolve(import.meta, '../../../resources/avatars/glenna.png'))

    log('Registering commands...')
    const guilds = Glenna.guilds.cache.map(g => g)
    for(const { id, name } of guilds){
        info(`\tRegistering commands on: ${name}`)
        await registerCommands({
            token: DISCORD_TOKEN,
            clientId: OAUTH_CLIENT_ID,
            guildId: id
        })
    }
    log('Initializing status...')
    start(updateStatus(Glenna.user!))
    log('Startup complete!')
})

Glenna.on('interactionCreate', async interaction => {
    if(!interaction.isCommand()) return;

    const command = Commands.get(interaction.commandName)
    if(!command) return;

    try {
        await command.execute(interaction);
    } catch(err){
        error(err);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        })
    }
})

export async function login(): Promise<void> {
    try {
        info("Logging in.")
        const reason = await Glenna.login(DISCORD_TOKEN)
        log(reason)
        info("Login successful.")
        info(`GlennaBot v.${VERSION} running.`)
    } catch(err){
        error(err)
        return
    }
}
