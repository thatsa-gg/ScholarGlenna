import { z } from 'zod'
import { database } from '../../../util/database.js'
import { subcommand } from '../../_command.js'
import { djs } from '../../_djs.js'

export const log = subcommand({
    description: 'Import Log CSV.',
    input: z.object({
        guild: djs.guild().transform(database.guild.transformOrThrow({ id: true }))
    }),
    async execute({ guild }, interaction){

    }
})
