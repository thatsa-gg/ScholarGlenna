import { listener } from '../EventListener.js'
import { error } from '../util/logging.js'
import { InteractionType } from 'discord.js'
import { ChatCommands, MessageCommands } from '../commands/index.js'

export const onCommandListener = listener('interactionCreate', {
    async execute(interaction){
        try {
            if(interaction.isMessageContextMenuCommand()){
                await MessageCommands.get(interaction.commandName)?.execute(interaction)
            }
            else if(interaction.type === InteractionType.ApplicationCommandAutocomplete){
                await ChatCommands.get(interaction.commandName)?.autocomplete?.(interaction)
            }
            else if(interaction.isChatInputCommand()){
                try {
                    await ChatCommands.get(interaction.commandName)?.execute(interaction)
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
