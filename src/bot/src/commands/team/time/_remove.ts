import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { AutocompleteTime } from './__common.js'

export const remove = subcommand({
    description: `Remove a team time (UTC).`,
    input: {
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        actor: djs.actor(),
        team: djs.team().describe('The team to remove times from.'),
        time: djs.autocomplete(djs.number(), { autocomplete: AutocompleteTime }).describe('The time to remove.')
    },
    authorization: {
        key: 'team',
        team: [ 'readTime', 'deleteTime' ]
    },
    async execute({ guild, team: snowflake, time: timeIndex }){
        const team = await database.team.findUniqueOrThrow({
            where: { snowflake, guild },
            select: {
                id: true,
                primaryTimeZone: true,
                daylightSavings: true,
                mention: true
            }
        })

        await database.teamTime.delete({
            where: {
                teamId_index: {
                    teamId: team.id,
                    index: timeIndex
                }
            }
        })

        await database.teamTime.updateMany({
            where: {
                teamId: team.id,
                index: { gt: timeIndex }
            },
            data: { index: { decrement: 1 }}
        })

        return `Time ${timeIndex} removed from team ${team.mention}.`
    }
})
