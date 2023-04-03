import { subcommand } from '../_command.js'
import { djs } from '../_djs.js'
import { z } from 'zod'
import { database } from '../../util/database.js'
import { EmbedBuilder } from '@glenna/discord'
import { TeamDaylightSavings, TeamFocus, TeamLevel, TeamRegion, TeamType } from '@glenna/prisma'
import tzdata from 'tzdata' assert { type: "json" }

const supportedZones = Object.keys(tzdata.zones)

export const update = subcommand({
    description: 'Update a raid team.',
    input: z.object({
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to update.'),
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        actor: djs.actor(),

        // options:
        name: z.string().nullable().describe("A new name."),
        alias: z.string().regex(/^[a-z0-9\-]+$/).nullable().describe("A new alias (used as an internal ID). Must be lowercase; digits and - are allowed."),
        focus: z.nativeEnum(TeamFocus).nullable().describe("The team focus."),
        level: z.nativeEnum(TeamLevel).nullable().describe("The team level."),
        region: z.nativeEnum(TeamRegion).nullable().describe("The team region."),
        capacity: djs.number(0, 1000).nullable().describe("The player capacity (0 for Unlimited)."),
        timezone: djs.string(b => b.setAutocomplete(true))
            .transform(a => [ a, supportedZones.find(b => b.toLowerCase() === a.toLowerCase()) ])
            .refine(([, r]) => r, ([ a ]) => ({ message: `Could not find a valid time zone ${a}.` }))
            .transform(([, r]) => r)
            .nullable().describe("The team's primary time zone."),
        type: z.enum([ 'InterestGroup', 'Normal' ] as const satisfies readonly TeamType[]).nullable().describe("The team type."),
        dst: z.nativeEnum(TeamDaylightSavings).nullable().describe("Whether the team times should respect DST or reset."),
    }),
    async authorize({ guild, actor, team: alias }){
        const team = await database.team.findUnique({
            where: { guildId_alias: { guildId: guild.id, alias }},
            select: { type: true }
        })
        return database.isAuthorized(guild, BigInt(actor.id), {
            // only management team captains can modify the properties of management teams
            role: team?.type === 'Management' ? 'Captain' : undefined,
            team: { type: 'Management' }
        })
    },
    async execute({ team: teamAlias, guild, name, alias, focus, level, region, capacity, type, timezone: primaryTimeZone, dst: daylightSavings }){
        const team = await database.team.update({
            where: { guildId_alias: { guildId: guild.id, alias: teamAlias }},
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
                new EmbedBuilder({
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
                        ... !primaryTimeZone ? [] : [{ name: 'Primary Time Zone', value: primaryTimeZone }],
                        ... !daylightSavings ? [] : [{ name: 'DST Shift?', value: daylightSavings }]
                    ]
                })
            ]
        }
    },
    async autocomplete({ name, value }, interaction){
        if(name === 'team')
            return await database.team.autocomplete(BigInt(interaction.guild!.id), value, { member: BigInt(interaction.user.id), orManager: true })
        if(name === 'timezone'){
            const search = value.toLowerCase()
            const matching = supportedZones
                .filter(zone => zone.toLowerCase().includes(search))
                .map(zone => ({ name: zone, value: zone }))
            const smaller = [
                'America/Detroit',
                'America/Chicago',
                'America/Edmonton',
                'America/Los Angeles',
                'Europe/London',
                'Europe/Berlin',
                'Europe/Athens',
                'Europe/Istanbul',
                'Australia/Sydney',
                'Australia/South',
                'Australia/West',
                'UTC',
            ]
            if(matching.length > 25){
                const smallerMatch = smaller.filter(z => z.toLowerCase().includes(search))
                if(smallerMatch.length === 0)
                    return smaller.map(name => ({ name, value: name }))
                return smallerMatch.map(name => ({ name, value: name }))
            }
            return matching
        }

        return
    }
})
