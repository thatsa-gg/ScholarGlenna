import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { formatDuration } from '@glenna/util'
import { slashCommandMention } from '../../_reference.js'

export const list = subcommand({
    description: `Fetch a team's session times.`,
    input: {
        team: djs.team().describe('The team to fetch times for.'),
        source: djs.guild(),
        actor: djs.actor(),
    },
    authorization: {
        key: 'team',
        team: [ 'read' ]
    },
    async execute({ team: snowflake, source }, interaction){
        const team = await database.team.findUniqueOrThrow({
            where: { snowflake, guild: { snowflake: BigInt(source.id) }},
            select: {
                type: true,
                name: true,
                nextRunTimes: true,
                nextDaylightSavingsShift: true,
            }
        })

        const runTimes = await team.nextRunTimes()
        const times = runTimes.map(time => `- (${time.index}) ${time} (${time.timeCode('d')} ${time.timeCode('t')}) for ${formatDuration(time.duration)}`)

        return {
            embeds: [
                {
                    color: 0x40a86d,
                    title: `Team ${team.name}`,
                    fields: [
                        {
                            name: 'Times',
                            value: times.length > 0 ? times.join(`\n`) : `*Use ${slashCommandMention(interaction, 'team', 'time', 'add')} to add run times to this team.*`
                        },
                        ...(team.nextDaylightSavingsShift === null ? [] : [
                            {
                                name: 'Next Daylight Savings Change',
                                value: team.nextDaylightSavingsShift.timeCode()
                            }
                        ])
                    ]
                }
            ]
        }
    }
})
