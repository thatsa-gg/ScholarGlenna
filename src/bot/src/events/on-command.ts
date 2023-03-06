import { listener } from '../EventListener.js'
import { error } from '../util/logging.js'
import { InteractionType } from '@glenna/discord'
import { ChatCommands, AutocompleteCommands, MessageContextCommands } from '../commands/index.js'

export const onCommandListener = listener('interactionCreate', {
    async execute(interaction){
        try {
            if(interaction.isMessageContextMenuCommand()){
                await MessageContextCommands.get(interaction.commandName)?.(interaction)
            }
            else if(interaction.type === InteractionType.ApplicationCommandAutocomplete){
                await AutocompleteCommands.get(interaction.commandName)?.(interaction)
            }
            else if(interaction.isChatInputCommand()){
                try {
                    await ChatCommands.get(interaction.commandName)?.(interaction)
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
