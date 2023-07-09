import { subcommand } from '../_command.js'
import { djs } from '../_djs.js'
import { database } from '../../util/database.js'
import { formatDuration, timeZoneFriendlyName } from '@glenna/util'

export const info = subcommand({
    description: 'Fetch team information.',
    input: {
        team: djs.team().describe('The team to fetch info for.'),
        source: djs.guild(),
        actor: djs.actor(),
    },
    authorization: {
        key: 'team',
        team: [ 'read' ]
    },
    async execute({ team: snowflake, source }){
        const team = await database.team.findUniqueOrThrow({
            where: {
                snowflake,
                guild: { snowflake: BigInt(source.id) }
            },
            select: {
                name: true,
                mention: true,

                alias: true,
                focus: true,
                level: true,
                region: true,
                capacity: true,
                primaryTimeZone: true,
                daylightSavings: true,

                nextDaylightSavingsShift: true,
                nextRunTimes: true,
                _count: {
                    select: {
                        members: true,
                        logs: true
                    }
                }
            }
        })

        const nextRuns = await team.nextRunTimes()
        const nextDST = team.nextDaylightSavingsShift

        return {
            embeds: [
                {
                    color: 0x40a86d,
                    title: `Team ${team.name}`,
                    description: `Properties for team ${team.mention}.`,
                    fields: [
                        { name: 'Focus', value: team.focus, inline: true },
                        { name: 'Level', value: team.level, inline: true },
                        { name: 'Region', value: team.region, inline: true },
                        { name: 'Capacity', value: `${team._count.members} / ${team.capacity ?? 'Unlimited'}` },
                        { name: 'Primary Time Zone', value: timeZoneFriendlyName(team.primaryTimeZone) },
                        {
                            name: 'DST Shift?',
                            value: team.daylightSavings === 'RespectTime'
                                ? `Keep the same time-of-day (Next change after ${nextDST?.timeCode() ?? '<Error>'})`
                                : 'Keep the same reset-relative time'
                        },
                        { name: 'Alias', value: team.alias, inline: true },
                        { name: 'Logs Submitted', value: team._count.logs.toString(), inline: true},
                        {
                            name: 'Times',
                            value: nextRuns
                                .map(time => `- (${time.index}) ${time} (${time.timeCode('d')} ${time.timeCode('t')}) for ${formatDuration(time.duration)}`)
                                .join("\n")
                        }
                    ]
                }
            ]
        }
    }
})
