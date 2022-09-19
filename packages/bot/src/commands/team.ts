import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { SlashCommand, SlashSubcommand } from '../Command.js'
import { loadAsync } from '@glenna/util'

const data = new SlashCommandBuilder()
    .setName('team')
    .setDescription('Raid team management.')
const subcommands = new Map<string, SlashSubcommand>()
for await(const subcommand of loadAsync<SlashSubcommand>(import.meta, './team')){
    data.addSubcommand(builder => subcommand.builder(builder).setName(subcommand.name))
    subcommands.set(subcommand.name, subcommand)
}

async function error(interaction: ChatInputCommandInteraction){
    await interaction.reply({
        ephemeral: true,
        content: "Unrecognized subcommand."
    })
}

export default new SlashCommand({
    data,
    async execute(interaction){
        const subcommand = interaction.options.getSubcommand()
        if(!subcommand)
            return await error(interaction)
        const exec = subcommands.get(subcommand)
        if(!exec)
            return await error(interaction)
        await exec.execute(interaction)
    }
})
