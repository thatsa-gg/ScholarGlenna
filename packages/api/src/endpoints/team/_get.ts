import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from "../../database.js"
import { stringifySnowflake } from '@glenna/prisma'

export const getProcedure = procedure
    .input(z.object({
        team: database.team.fetch('team', { snowflake: true, name: true })
    }))
    .query(({ input: { team } }) => stringifySnowflake(team))
