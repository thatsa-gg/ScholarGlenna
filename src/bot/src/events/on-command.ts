import { listener } from '../EventListener.js'
import { error, warn } from '../util/logging.js'
import { Commands } from '../commands/index.js'
import { PublicError } from '../PublicError.js'

export const onCommandListener = listener('interactionCreate', {
    async execute(interaction){
        try {
            if(!(interaction.isCommand() || interaction.isAutocomplete()))
                return
            try {
                const command = Commands.get(interaction.commandName)
                if(!command)
                    throw `No such command ${interaction.commandName}`
                if(interaction.isMessageContextMenuCommand()){
                    if(!command.message)
                        throw `Command ${interaction.commandName} does not support message context menu commands.`
                    await command.message(interaction)
                }
                else if(interaction.isUserContextMenuCommand()){
                    if(!command.user)
                        throw `Command ${interaction.commandName} does not support user context menu commands.`
                    await command.user(interaction)
                }
                else if(interaction.isAutocomplete()){
                    if(!command.autocomplete){
                        warn(`Command "${interaction.commandName}" does not support autocomplete.`)
                        return
                    }
                    await command.autocomplete(interaction)
                }
                else if(interaction.isChatInputCommand()){
                    if(!command.chat)
                        throw `This command is not a chat command.`
                    await command.chat(interaction)
                }
            } catch(err){
                const content = err instanceof PublicError ? err.message : 'There was an error while executing this command!'
                if(interaction.isRepliable()){
                    if(interaction.replied)
                        await interaction.editReply({ content })
                    else
                        await interaction.reply({ content, ephemeral: true })
                }
                throw err
            }
        } catch(err) {
            error(err)
        }
    }
})
