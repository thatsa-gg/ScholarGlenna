import { ComponentType, EmbedBuilder } from '@glenna/discord'
import { database } from '../../util/database.js'
import { actions, select } from '../_actions.js'
import { user } from '../_command.js'

const TEN_MINUTES_MS = 10 * 60 * 1000
export const teamMemberAdd = user({
    async execute(member, source, interaction){
        const guild = await database.guild.findUniqueOrThrow({
            where: { snowflake: BigInt(source.id) },
            select: { id: true }
        })
        const validTeams = await database.team.findMany({
            where: {
                guild,
                members: { none: { member: { snowflake: BigInt(member.user.id) }}}
            },
            select: {
                name: true,
                snowflake: true
            },
            orderBy: { name: 'desc' }
        })

        const replyMessage = await interaction.reply({
            ephemeral: true,
            content: `Which team should I add <@${member.user.id}> to?`,
            components: [
                actions.select(select('team', 'Choose a team.',
                    ...validTeams.map(({ name, snowflake }) => ({
                        label: name,
                        value: snowflake.toString()
                    }))
                ))
            ]
        })

        const response = await replyMessage.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            time: TEN_MINUTES_MS,
            filter(select){
                select.deferUpdate();
                return select.user.id === interaction.user.id
            }
        })

        const [ value ] = response.values
        if(!value)
            throw `No team selected!`
        const team = await database.team.findUniqueOrThrow({
            where: { snowflake: BigInt(value) },
            select: {
                id: true,
                name: true
            }
        })
        const guildMember = await database.guildMember.findOrCreate(guild, member)
        await database.teamMember.add(team, guildMember)

        return {
            embeds: [
                new EmbedBuilder({
                    color: 0x40a86d,
                    title: `Team ${team.name}`,
                    fields: [
                        {
                            name: 'Added Member',
                            value: `<@${member.user.id}>`
                        }
                    ]
                })
            ],
            content: '',
            components: []
        }
    }
})
