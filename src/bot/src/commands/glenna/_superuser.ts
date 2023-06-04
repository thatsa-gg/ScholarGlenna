import { database } from '../../util/database.js'
import { subcommand } from '../_command.js'

export const superuser = subcommand({
    description: 'Claim superuser privileges.',
    async execute(_, interaction){
        const role = await database.role.findFirstOrThrow({ where: { type: 'SuperUser' }, select: { id: true }})
        const user = await database.user.findFirstOrThrow({ where: { snowflake: BigInt(interaction.user.id) }})
        if(await database.roleMember.findFirst({ where: { role }, select: { id: true }})){
            throw `A SuperUser already exists. Don't try that again.`
        }

        await database.roleMember.create({
            data: {
                role: { connect: role },
                user: { connect: user }
            }
        })
    }
})
