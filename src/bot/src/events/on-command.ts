import { listener } from '../EventListener.js'
import { debug, error, warn } from '../util/logging.js'
import { Commands } from '../commands/index.js'

export const onCommandListener = listener('interactionCreate', {
    async execute(interaction){
        try {
            if(interaction.isMessageContextMenuCommand()){
                await Commands.get(interaction.commandName)?.message?.(interaction)
            }
            else if(interaction.isAutocomplete()){
                debug(`Dispatching autocomplete for ${interaction.commandName}`)
                const command = Commands.get(interaction.commandName)
                if(!command){
                    warn(`Tried to dispatch unknown command "${interaction.commandName}"`)
                    return
                }
                if(!command.autocomplete){
                    warn(`Command "${interaction.commandName}" does not support autocomplete.`)
                    return
                }
                await command.autocomplete(interaction)
            }
            else if(interaction.isChatInputCommand()){
                try {
                    const command = Commands.get(interaction.commandName)?.chat
                    if(!command)
                        throw `This command is not a chat command.`
                    await command(interaction)
                } catch(err){
                    if(interaction.isRepliable()){
                        await interaction.reply({
                            content: 'There was an error while executing this command!',
                            ephemeral: true
                        })
                    }
                    throw err
                }
            }
        } catch(err) {
            error(err)
        }
    }
})
