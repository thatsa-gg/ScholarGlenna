import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from '@glenna/discord'
import { database } from '../../util/database.js'
import { getGuildAndUser } from '../index.js'
import { messageCommand, type MessageCommandHelper } from '../message-builders.js'

const LinkRegexp = /\b(?:https:\/\/)?(?:dps\.report\/[a-zA-Z0-9_-]+|gw2wingman\.nevermindcreations\.de\/log\/[a-zA-Z0-9_-]+)\b/g

export const messageSubmitLogs: MessageCommandHelper = messageCommand('Submit Logs', {
    async execute(interaction){
        const [ sourceGuild, sourceUser ] = await getGuildAndUser(interaction) || []
        if(!sourceGuild || !sourceUser) return

        const teams = await database.team.findMany({
            where: {
                members: {
                    some: {
                        member: {
                            snowflake: BigInt(sourceUser.user.id),
                            guild: { snowflake: BigInt(sourceGuild.id) }
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true
            }
        })
        if(teams.length > 1){
            const message = await interaction.reply({
                ephemeral: true,
                content: 'Which team are you submitting these for?',
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(...teams.map(team =>
                        new ButtonBuilder({
                            customId: team.id.toString(),
                            label: team.name,
                            style: ButtonStyle.Secondary
                        })
                    ))
                ]
            })
            message.id
            // TODO: select team?
        }
        // TODO: deny if no teams
        const logs = Array.from(interaction.targetMessage.content.matchAll(LinkRegexp), match => match[0])
        // TODO: submit to API for ingestion
    }
})
