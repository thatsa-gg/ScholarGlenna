import { z } from 'zod'
import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'
import { debug } from '../../../util/logging.js'
import { EmbedBuilder } from '@glenna/discord'

export const add = subcommand({
    description: 'Add a member to a team.',
    input: z.object({
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to modify.'),
        member: djs.user().describe('The member to add.'),
        source: djs.guild(),
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true }))
    }),
    async execute({ team: teamName, member: user, source, guild }){
        const member = await source.members.fetch(user)
        if(!member)
            throw `Could not find member in guild.`
        const team = await database.team.findUniqueOrThrow({
            where: { guildId_alias: { guildId: guild.id, alias: teamName }},
            select: {
                id: true,
                name: true,
                mention: true
            }
        })
        const guildMember = await database.guildMember.findOrCreate(guild, member)
        await database.teamMember.add(team, guildMember)
        const username = member.nickname ?? `${user.username}#${user.discriminator}`
        debug(`Added ${username} to team ${team.name} (${team.id}).`)

        return {
            embeds: [
                new EmbedBuilder({
                    color: 0x40a86d,
                    title: `Team ${team.mention}`,
                    fields: [
                        {
                            name: 'Added Member',
                            value: `<@${member.user.id}>`
                        }
                    ]
                })
            ]
        }
    },
    async autocomplete({ name, value }, interaction){
        if(name === 'team')
            return await database.team.autocomplete(BigInt(interaction.guild!.id), value)

        return
    }
})
