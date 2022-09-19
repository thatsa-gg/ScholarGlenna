import { listener } from '../EventListener.js'
import { AutocompleteCommands, ChatCommands, UserCommands } from '../Command.js'
import { error } from 'console'
import { AutocompleteInteraction, BaseInteraction, Collection, InteractionType } from 'discord.js'
import type { CommandHandler } from '../Command.js'

async function dispatchCommand<T extends BaseInteraction & { commandName: string }>
(interaction: T, commandPool: Collection<string, CommandHandler<T>>){
    const command = commandPool.get(interaction.commandName)
    if(!command)
        return

    try {
        await command.execute(interaction)
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

async function autocompleteCommand(interaction: AutocompleteInteraction){
    const command = AutocompleteCommands.get(interaction.commandName)
    if(!command)
        return
    try {
        await command.autocomplete(interaction)
    } catch(err){
        error(err)
    }
}

export default listener('interactionCreate', {
    async execute(interaction){
        if(interaction.type === InteractionType.ApplicationCommandAutocomplete)
            await autocompleteCommand(interaction)
        else if(interaction.isChatInputCommand())
            await dispatchCommand(interaction, ChatCommands)
        else if(interaction.isUserContextMenuCommand())
            await dispatchCommand(interaction, UserCommands)
    }
})
