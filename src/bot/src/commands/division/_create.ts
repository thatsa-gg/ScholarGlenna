import { subcommand } from '../_command.js'
import { djs } from '../_djs.js'
import { z } from 'zod'
import { database } from '../../util/database.js'
import { debug } from '../../util/logging.js'
import { EmbedBuilder } from '@glenna/discord'

export const create = subcommand({
    description: 'Create a new raid division.',
    input: z.object({
        name: z.string().describe('Division name.'),
        primary: z.boolean().nullable().transform(a => a ?? false).describe('Is this the new primary division for the guild?'),
        source: djs.guild(),
        actor: djs.actor(),
    }),
    async authorize({ source, actor }){
        return database.isAuthorized(BigInt(source.id), BigInt(actor.id))
    },
    async execute({ name, primary, source }){
        const snowflake = BigInt(source.id)
        const division = await database.$transaction(async database => {
            if(primary){
                // unmark the old primary
                await database.division.updateMany({
                    where: { primary: true, guild: { snowflake }},
                    data: { primary: false }
                })
            }
            return await database.division.create({
                data: {
                    name, primary,
                    guild: { connect: { snowflake }}
                },
                select: {
                    id: true,
                    name: true,
                    snowflake: true,
                    guild: {
                        select: {
                            id: true
                        }
                    }
                }
            })
        })
        debug(`Create division "${division.name}" (${division.id}) in guild "${source.name}" (${division.guild.id})`)
        const embed = new EmbedBuilder({
            color: 0x40a86d,
            title: `Division ${division.name} registered.`
        })
        if(primary){
            embed.addFields({
                inline: true,
                name: 'Default division',
                value: 'This is the default division for this guild.'
            })
        }
        return { embeds: [ embed ]}
    }
})
