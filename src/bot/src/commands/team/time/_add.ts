import { z } from 'zod'
import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { Temporal } from '@js-temporal/polyfill'

import { Days } from './__common.js'

export const add = subcommand({
    description: `Add a team time (UTC).`,
    input: z.object({
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
        actor: djs.actor(),
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to add times for.'),
        day: z.nativeEnum(Days).describe('Day-of-week (in UTC).'),
        reset: djs.number(-24, 24).describe('Offset relative to daily reset (0:00 UTC).'),
        duration: djs.number(15, 1440).nullable().transform(a => a ?? 120).describe('The duration in minutes.')
    }),
    authorization: {
        team: 'createTime', key: 'team'
    },
    async authorize({ guild, actor }){
        return database.isAuthorized(guild, BigInt(actor.id))
    },
    async execute({ guild, team: teamName, duration, day, reset }){
        const team = await database.team.findUniqueOrThrow({
            where: { guildId_alias: { guildId: guild.id, alias: teamName }},
            select: {
                id: true,
                primaryTimeZone: true,
                daylightSavings: true,
                mention: true,
                _count: {
                    select: {
                        times: true
                    }
                }
            }
        })

        const now = Temporal.Now.zonedDateTimeISO('UTC')
        const today = now.round({ smallestUnit: 'day', roundingMode: 'floor' })
        const time = await database.teamTime.create({
            data: {
                team: { connect: { id: team.id }},
                index: team._count.times + 1,
                duration,
                time: new Date(today.subtract({ days: today.dayOfWeek })
                    .add({ days: day })
                    .add(reset ? Temporal.Duration.from({ minutes: (reset * 60)|0 }) : now.since(today))
                    .epochMilliseconds)
            },
            select: {
                index: true,
                nextRun: true
            }
        })
        return `Time ${time.index} added to team ${team.mention}! New time: ${time.nextRun(team)}`
    },
    async autocomplete({ name, value }, interaction) {
        if(name === 'team')
            return await database.team.autocomplete(BigInt(interaction.guild!.id), value, { member: BigInt(interaction.user.id), orManager: true })

        return
    },
})
