import { listener } from '../EventListener'
import { Commands } from '../commands'
import { error } from 'console'

export default listener('interactionCreate', {
    async execute(interaction){
        if(!interaction.isCommand())
            return

        const command = Commands.get(interaction.commandName)
        if(!command)
            return

        try {
            await command.execute(interaction)
        } catch(err){
            error(err)
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            })
        }
    }
})
