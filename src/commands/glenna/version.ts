import { VERSION } from "../../properties";
import { SlashSubcommand } from "../../SlashCommand";

export default new SlashSubcommand({
    name: 'version',
    builder: (a) => a.setDescription('Return the current version of the bot.'),
    async execute(interaction){
        await interaction.reply(`This is Glenna v.${VERSION}. Excelsior!`)
    }
})
