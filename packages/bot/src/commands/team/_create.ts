import { database } from '../../util/database.js'
import { ChannelType } from 'discord.js'
import { slashSubcommand, type SlashSubcommandHelper } from '../index.js'
import { slugify } from '@glenna/util'

export const teamCreateCommand: SlashSubcommandHelper = slashSubcommand('create', {
    builder(builder){
        return builder.setDescription('Create a new raid team.')
            .addStringOption(o => o.setName('name').setDescription('Team name.').setRequired(true))
            .addChannelOption(o => o.setName('channel').setDescription('Team channel.').addChannelTypes(ChannelType.GuildText))
            .addRoleOption(o => o.setName('role').setDescription('Team role for member syncing and pinging.'))
    },
    async execute(interaction){
        const sourceGuild = interaction.guild
        if(!sourceGuild){
            await interaction.reply({
                ephemeral: true,
                content: `This command must be executed in a guild.`
            })
            return
        }

        const channel = interaction.options.getChannel('channel') || null
        const role = interaction.options.getRole('role') || null
        const name = interaction.options.getString('name', true)
        const team = await database.team.create({
            data: {
                name,
                channel: channel ? BigInt(channel.id) : null,
                role: role ? BigInt(role.id) : null,
                alias: slugify(name),
                guild: { connect: { snowflake: BigInt(sourceGuild.id) }},
            }
        })

        // TODO: better response
        await interaction.reply(`Raid team created! (id: ${team.id})`)
    }
})
