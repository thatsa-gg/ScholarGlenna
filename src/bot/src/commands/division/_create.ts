import { database } from '../../util/database.js'
import { EmbedBuilder } from 'discord.js'
import { getGuildAndUser, slashSubcommand, type SlashSubcommandHelper } from '../index.js'
import { debug } from '../../util/logging.js'

export const divisionCreateCommand: SlashSubcommandHelper = slashSubcommand('create', {
    builder(builder){
        return builder.setDescription('Create a new raid division.')
            .addStringOption(o => o.setName('name').setDescription('Division name.').setRequired(true))
            .addBooleanOption(o => o.setName('primary').setDescription('Is this the new primary division for this guild?'))
    },
    async execute(interaction){
        const [ sourceGuild, sourceUser ] = await getGuildAndUser(interaction) || []
        if(!sourceGuild || !sourceUser) return
        const guildSnowflake = BigInt(sourceGuild.id)
        const userSnowflake = BigInt(sourceUser.user.id)

        if(!database.isAuthorized(guildSnowflake, userSnowflake)){
            await interaction.reply({
                ephemeral: true,
                content: `You are not authorized to execute this command.`
            })
            return
        }

        const name = interaction.options.getString('name', true)
        const primary = interaction.options.getBoolean('primary') || false
        if(primary){
            // unmark the old primary
            await database.division.updateMany({ where: { primary: true }, data: { primary: false }})
        }
        const division = await database.division.create({
            data: {
                name, primary,
                guild: { connect: { snowflake: guildSnowflake }}
            },
            select: {
                id: true,
                name: true,
                snowflake: true,
                guild: {
                    select: {
                        id: true
                    }
                }
            }
        })
        debug(`Create division "${division.name}" (${division.id}) in guild "${sourceGuild.name}" (${sourceGuild.id})`)

        const embed = new EmbedBuilder({
            color: 0x40a86d,
            title: `Division ${division.name} registered.`
        })
        if(primary){
            embed.addFields({
                inline: true,
                name: 'Default division',
                value: 'This is the default division for this guild.'
            })
        }

        await interaction.reply({ embeds: [ embed ]})
    }
})
