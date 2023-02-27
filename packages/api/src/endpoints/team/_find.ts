import { z } from 'zod'
import { procedure } from '../../trpc.js'
import { database } from "../../database.js"
import { stringifySnowflake, TeamFocus, TeamLevel, TeamRegion, TeamType } from '@glenna/prisma'

const commonProperties = z.object({
    name: z.string().optional(),
    focus: z.nativeEnum(TeamFocus).optional(),
    level: z.nativeEnum(TeamLevel).optional(),
    region: z.nativeEnum(TeamRegion).optional(),
    type: z.union([ z.nativeEnum(TeamType), z.nativeEnum(TeamType).array() ]).optional()
})

export const findProcedure = procedure
    .input(z.union([
        commonProperties,
        commonProperties.extend({ guild: database.guild.validateSnowflake('guild') }),
        commonProperties.extend({ division: database.division.validateSnowflake('division') })
    ]))
    .query(async ({ input }) => {
        const teams = await database.team.findMany({
            where: {
                name: input.name,
                focus: input.focus,
                level: input.level,
                region: input.region,
                type: Array.isArray(input.type) ? { in: input.type } : input.type,
                guild: 'guild' in input ? { snowflake: input.guild } : undefined,
                division: 'division' in input ? { snowflake: input.division } : undefined
            },
            select: {
                snowflake: true,
                name: true
            }
        })
        return teams.map(stringifySnowflake)
    })
