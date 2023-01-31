import { listener } from '../EventListener.js'
import { error } from '../util/logging.js'
import { InteractionType } from 'discord.js'
import { ChatCommands } from '../commands/index.js'

export const onCommandListener = listener('interactionCreate', {
    async execute(interaction){
        if(interaction.type === InteractionType.ApplicationCommandAutocomplete){
            try {
                await ChatCommands.get(interaction.commandName)?.autocomplete?.(interaction)
            } catch(err) {
                error(err)
            }
        }
        else if(interaction.isChatInputCommand()){
            try {
                await ChatCommands.get(interaction.commandName)?.execute(interaction)
            } catch(err){
                error(err)
                if(interaction.isRepliable()){
                    await interaction.reply({
                        content: 'There was an error while executing this command!',
                        ephemeral: true
                    })
                }
            }
        }
    }
})
