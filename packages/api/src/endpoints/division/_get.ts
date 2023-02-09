import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from "../../database.js"
import { stringifySnowflake } from '@glenna/prisma'

export const getProcedure = procedure
    .input(z.object({
        division: database.division.fetch('division', {
            name: true,
            snowflake: true
        })
    }))
    .query(({ input: { division }}) => stringifySnowflake(division))
