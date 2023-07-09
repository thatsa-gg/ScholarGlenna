import { subcommand } from '../_command.js'
import { djs } from '../_djs.js'
import { database } from '../../util/database.js'
import { TeamDaylightSavings, TeamFocus, TeamLevel, TeamRegion, TeamType } from '@glenna/prisma'
import { timeZoneFriendlyName } from '@glenna/util'

export const update = subcommand({
    description: 'Update a raid team.',
    input: {
        team: djs.team().describe('The team to update.'),
        source: djs.guild(),
        actor: djs.actor(),

        // options:
        name: djs.string().nullable().describe("A new name."),
        alias: djs.string().regex(/^[a-z0-9\-]+$/).nullable().describe("A new alias (used as an internal ID). Must be lowercase; digits and - are allowed."),
        focus: djs.nativeEnum(TeamFocus).nullable().describe("The team focus."),
        level: djs.nativeEnum(TeamLevel).nullable().describe("The team level."),
        region: djs.nativeEnum(TeamRegion).nullable().describe("The team region."),
        capacity: djs.number(0, 1000).nullable().describe("The player capacity (0 for Unlimited)."),
        timezone: djs.timezone().nullable().describe("The team's primary time zone."),
        type: djs.stringEnum([ 'InterestGroup', 'Normal' ] as const satisfies readonly TeamType[]).nullable().describe("The team type."),
        dst: djs.nativeEnum(TeamDaylightSavings).nullable().describe("Whether the team times should respect DST or reset."),
    },
    authorization: { key: 'team', team: 'update' },
    async execute({ team: snowflake, source, name, alias, focus, level, region, capacity, type, timezone: primaryTimeZone, dst: daylightSavings }){
        const team = await database.team.update({
            where: { snowflake, guild: { snowflake: BigInt(source.id) }},
            data: {
                name: name ?? undefined,
                alias: alias ?? undefined,
                focus: focus ?? undefined,
                level: level ?? undefined,
                region: region ?? undefined,
                type: type ?? undefined,
                capacity: capacity === 0 ? null : capacity ?? undefined,
                primaryTimeZone: primaryTimeZone ?? undefined,
                daylightSavings: daylightSavings ?? undefined,
            },
            select: {
                name: true,
                mention: true
            }
        })

        return {
            embeds: [
                {
                    color: 0x40a86d,
                    title: `Team ${team.name} Updated`,
                    description: `${team.mention} has been updated.`,
                    fields: [
                        ... !name ? [] : [{ name: 'Name', value: name, inline: true }],
                        ... !alias ? [] : [{ name: 'Alias', value: alias, inline: true }],
                        ... !focus ? [] : [{ name: 'Focus', value: focus, inline: true }],
                        ... !region ? [] : [{ name: 'Region', value: region, inline: true }],
                        ... capacity === null ? []
                            : capacity === 0 ? [{ name: 'Capacity', value: 'Unlimited', inline: true }]
                            : [{ name: 'Capacity', value: capacity.toString(), inline: true }],
                        ... !primaryTimeZone ? [] : [{ name: 'Primary Time Zone', value: timeZoneFriendlyName(primaryTimeZone) }],
                        ... !daylightSavings ? [] : [{ name: 'DST Shift?', value: daylightSavings }]
                    ]
                }
            ]
        }
    }
})
