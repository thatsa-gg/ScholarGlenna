import { subcommand } from '../_command.js'
import { djs } from '../_djs.js'
import { z } from 'zod'
import { database } from '../../util/database.js'
import { EmbedBuilder } from '@glenna/discord'
import { formatDuration } from '@glenna/util'

export const info = subcommand({
    description: 'Fetch team information.',
    input: z.object({
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to fetch info for.'),
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        actor: djs.actor(),
    }),
    async authorize({ guild, actor, team }){
        return database.isAuthorized(guild, BigInt(actor.id), {
            team: { alias: team }
        })
    },
    async execute({ team: teamAlias, guild }){
        const team = await database.team.findUniqueOrThrow({
            where: { guildId_alias: { guildId: guild.id, alias: teamAlias }},
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
                new EmbedBuilder({
                    color: 0x40a86d,
                    title: `Team ${team.name}`,
                    description: `Properties for team ${team.mention}.`,
                    fields: [
                        { name: 'Focus', value: team.focus, inline: true },
                        { name: 'Level', value: team.level, inline: true },
                        { name: 'Region', value: team.region, inline: true },
                        { name: 'Capacity', value: `${team._count.members} / ${team.capacity ?? 'Unlimited'}` },
                        { name: 'Primary Time Zone', value: team.primaryTimeZone },
                        {
                            name: 'DST Shift?',
                            value: `${team.daylightSavings}${nextDST ? ` (${nextDST.timeCode()}}` : ''}`
                        },
                        { name: 'Alias', value: team.alias, inline: true },
                        { name: 'Logs Submitted', value: team._count.logs.toString(), inline: true},
                        {
                            name: 'Times',
                            value: nextRuns
                                .map(({ index, timeCode, duration }) => `- (${index}) ${timeCode()} for ${formatDuration(duration)}`)
                                .join("\n")
                        }
                    ]
                })
            ]
        }
    },
    async autocomplete({ name, value }, interaction){
        if(name === 'team')
            return await database.team.autocomplete(BigInt(interaction.guild!.id), value, { member: BigInt(interaction.user.id), orManager: true })

        return
    }
})
