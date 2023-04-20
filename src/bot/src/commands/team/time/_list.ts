import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { formatDuration } from '@glenna/util'
import { slashCommandMention } from '../../_reference.js'

export const list = subcommand({
    description: `Fetch a team's session times.`,
    input: {
        team: djs.team().describe('The team to fetch times for.'),
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        actor: djs.actor(),
    },
    authorization: {
        key: 'team',
        team: [ 'readTime' ]
    },
    async execute({ team: snowflake, guild }, interaction){
        const team = await database.team.findUniqueOrThrow({
            where: { snowflake, guild },
            select: {
                type: true,
                name: true,
                nextRunTimes: true,
                nextDaylightSavingsShift: true,
            }
        })

        const runTimes = await team.nextRunTimes()
        const times = runTimes.map(({ index, timeCode, duration }) => `(${index}) ${timeCode()} for ${formatDuration(duration)}`)

        return {
            embeds: [
                {
                    color: 0x40a86d,
                    title: `Team ${team.name}`,
                    fields: [
                        {
                            name: 'Times',
                            value: times.length > 0 ? times.map(a => `- ${a}`).join(`\n`) : `*Use ${slashCommandMention(interaction, 'team', 'time', 'add')} to add run times to this team.*`
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
