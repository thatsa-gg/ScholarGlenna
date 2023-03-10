import { z } from 'zod'
import { database } from '../../util/database.js'
import { subcommand } from '../_command.js'
import { djs } from '../_djs.js'
import { debug } from '../../util/logging.js'

export const role = subcommand({
    description: `Modify or remove a team's role.`,
    input: z.object({
        team: djs.string(b => b.setAutocomplete(true)).describe('The team to modify.'),
        clear: z.boolean().default(false).describe('Should the role be removed?'),
        removesynced: z.boolean().default(false).describe('Remove the old role members from the team? Manually added members will not be removed.'),
        role: djs.role().nullable().describe('The new role.'),
        source: djs.guild(),
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true })),
    }),
    async execute({ team: teamName, clear, removesynced: removeSyncedMembers, role, guild, source }){
        const team = await database.team.findUniqueOrThrow({
            where: { guildId_alias: { guildId: guild.id, alias: teamName }},
            select: {
                id: true,
                name: true,
                type: true,
                role: true,
            }
        })
        if(clear){
            await database.team.update({ where: { id: team.id }, data: { role: null }})
            if(removeSyncedMembers && team.role)
                await database.teamMember.deleteWhereRole(team, team.role)
            // TODO: message
            return
        }

        if(!role)
            throw `Missing role and clear is not true!`
        await source.members.fetch()
        const realizedRole = await source.roles.fetch(role.id)
        if(!realizedRole)
            throw `Could not fetch role with members!`
        await database.team.update({ where: { id: team.id }, data: { role: BigInt(role.id) }})
        if(removeSyncedMembers && team.role)
            await database.teamMember.deleteWhereRole(team, team.role)
        const members: string[] = []
        for(const member of realizedRole.members.values()){
            members.push(member.displayName)
            debug(`Adding "${member.displayName}" to "${team.name}".`)
            const guildMember = await database.guildMember.findOrCreate(guild, member)
            await database.teamMember.add(team, guildMember, { source: realizedRole })
        }

        // TODO: message
    },
    async autocomplete({ name, value }, interaction){
        if(name === 'team')
            return await database.team.autocomplete(BigInt(interaction.guild!.id), value)

        return
    }
})
