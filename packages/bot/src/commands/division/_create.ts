import { database } from '../../util/database.js'
import { EmbedBuilder } from 'discord.js'
import { getGuildAndUser, slashSubcommand, type SlashSubcommandHelper } from '../index.js'
import { debug } from '../../util/logging.js'

export const divisionCreateCommand: SlashSubcommandHelper = slashSubcommand('create', {
    builder(builder){
        return builder.setDescription('Create a new raid division.')
            .addStringOption(o => o.setName('name').setDescription('Division name.').setRequired(true))
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
        const division = await database.division.create({
            data: {
                name,
                guild: { connect: { snowflake: guildSnowflake }}
            },
            select: {
                id: true,
                name: true,
                snowflake: true,
                guild: {
                    select: {
                        id: true,
                        primaryDivisionId: true
                    }
                }
            }
        })
        debug(`Create division "${division.name}" (${division.id}) in guild "${sourceGuild.name}" (${sourceGuild.id})`)

        if(null === division.guild.primaryDivisionId){
            await database.guild.update({
                where: { id: division.guild.id },
                data: {
                    primaryDivisionId: division.guild.id
                }
            })
            const unassociatedTeams = await database.team.findMany({
                where: {
                    guild: { id: division.guild.id },
                    divisions: { none: {} }
                },
                select: {
                    id: true
                }
            })
            await database.teamDivision.createMany({
                data: unassociatedTeams.map(team => ({ teamId: team.id, divisionId: division.id }))
            })
            division.guild.primaryDivisionId = division.id
            debug(`Set division "${division.name}" (${division.id}) as primary for guild "${sourceGuild.name}" (${sourceGuild.id}) -- missing primary.`)
        }

        const embed = new EmbedBuilder({
            color: 0x40a86d,
            title: `Division ${division.name} registered.`
        })
        if(division.guild.primaryDivisionId === division.id){
            embed.addFields({
                inline: true,
                name: 'Default division',
                value: 'This is the default division for this guild.'
            })
        }

        await interaction.reply({ embeds: [ embed ]})
    }
})
