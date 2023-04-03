import { subcommand } from '../_command.js'
import { djs } from '../_djs.js'
import { z } from 'zod'
import { database } from '../../util/database.js'
import { slugify } from '@glenna/util'
import { debug } from '../../util/logging.js'
import { EmbedBuilder } from '@glenna/discord'
import { slashCommandMention, teamMember } from '../_reference.js'
import type { TeamMemberRole } from '@glenna/prisma'
import { PublicError } from '../../PublicError.js'

export const create = subcommand({
    description: 'Create a new raid team.',
    input: z.object({
        name: z.string().describe('Team name.'),
        channel: djs.channel().nullable().describe('Team channel.'),
        role: djs.role().nullable().describe('Team role for member syncing and pinging.'),
        source: djs.guild(),
        guild: djs.guild().transform(database.guild.transformOrThrow({
            id: true,
            divisions: {
                where: { primary: true },
                select: { id: true }
            }
        })),
        actor: djs.actor(),
    }),
    async authorize({ guild, actor }){
        return database.isAuthorized(guild, BigInt(actor.id), {
            team: { type: 'Management' }
        })
    },
    async execute(options, interaction) {
        debug(options)
        const { name, channel, role, source, guild, guild: { divisions: [division] } } = options
        if(!division)
            throw new PublicError(`Fatal error: guild ${guild.id} is missing a primary division!`)
        const team = await database.team.create({
            data: {
                name,
                role: role ? BigInt(role.id) : null,
                channel: channel ? BigInt(channel.id) : null,
                alias: slugify(name),
                guild: { connect: { id: guild.id }},
                division: { connect: division }
            },
            select: {
                id: true,
                name: true,
                type: true,
                snowflake: true,
                role: true,
                mention: true
            }
        })
        debug(`Create team "${team.name}" (${team.id}) in guild "${source.name}" (${guild.id})`)

        const members: { id: string, role: TeamMemberRole }[] = []
        if(role){
            await source.members.fetch()
            const realizedRole = await source.roles.fetch(role.id)
            if(!realizedRole)
                throw `Could not fetch role with members!`
            for(const member of realizedRole.members.values()){
                const role = team.type === 'Management'
                    && source.ownerId === member.user.id
                    ? 'Captain' : 'Member'
                members.push({ id: member.id, role })
                debug(`Adding "${member.displayName}" to "${team.name}".`)
                const guildMember = await database.guildMember.findOrCreate(guild, member)
                await database.teamMember.add(team, guildMember, { role })
            }
        }

        return {
            embeds: [
                new EmbedBuilder({
                    color: 0x40a86d,
                    title: `Team ${team.name} Created`,
                    description: `${team.mention} has been registered.`,
                    fields: [
                        {
                            name: 'Members',
                            value: members.length > 0
                                ? members.map(a => `- ${teamMember(a)}`).join(`\n`)
                                : team.role !== null
                                    ? `*Add members to <@&${team.role}> to add them to this team.*`
                                    : `*Use ${slashCommandMention(interaction, 'team', 'member', 'add')} to add members to this team.*`
                        }
                    ]
                })
            ]
        }
    }
})
