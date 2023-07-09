import { Prisma } from '../../generated/client/index.js'
import { z } from 'zod'

const bigintString = (name: string) =>
    z.union([
        z.string()
            .regex(/^\d+$/, { message: `${name} must be a numeric string.` })
            .transform(a => BigInt(a)),
        z.bigint()
    ]).refine(a => a <= 0x7FFFFFFFFFFFFFFFn, { message: `${name} must be a valid snowflake.` })

export const refineExtension = Prisma.defineExtension((client) => client.$extends({
    model: {
        guild: {
            validateSnowflake<T extends string>(name: T){
                return bigintString(name).refine(
                    async (snowflake) => await client.guild.findUnique({ where: { snowflake }, select: { id: true }}),
                    snowflake => ({ message: `No guild with snowflake "${snowflake}" found.` })
                )
            },
        },
        team: {
            validateSnowflake<T extends string>(name: T){
                return bigintString(name).refine(
                    async snowflake => await client.team.findUnique({ where: { snowflake }, select: { id: true }}),
                    snowflake => ({ message: `No team with snowflake "${snowflake}" found.`})
                )
            },
        },
        division: {
            validateSnowflake(name: string){
                return bigintString(name).refine(
                    async snowflake => await client.division.findUnique({ where: { snowflake }, select: { id: true }}),
                    snowflake => ({ message: `No division with snowflake "${snowflake}" found.`})
                )
            },
        }
    }
}))
