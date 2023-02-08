import { Prisma } from '../../generated/client/index.js'
import { z } from 'zod'

const bigintString = (name: string) =>
    z.string()
        .regex(/^\d+$/, { message: `${name} must be a numeric string.` })
        .transform(a => BigInt(a))
        .refine(a => a <= 0x7FFFFFFFFFFFFFFFn, { message: `${name} must be a valid snowflake.` })

export const refineExtension = Prisma.defineExtension((client) => client.$extends({
    model: {
        guild: {
            validateSnowflake<T extends string>(name: T){
                return bigintString(name).refine(
                    async snowflake => await client.guild.findUnique({ where: { snowflake }, select: { _count: true }}),
                    snowflake => ({ message: `No guild with snowflake "${snowflake}" found.` })
                )
            },
            fetch<T extends Prisma.GuildSelect>(name: string, properties: T){
                return bigintString(name)
                    .transform(async snowflake => await client.guild.findUnique({ where: { snowflake }, select: properties }) ?? snowflake)
                    .refine(
                        <T>(a: T): a is Exclude<T, bigint> => typeof a !== 'bigint',
                        snowflake => ({ message: `No guild with snowflake "${snowflake}" found.` })
                    )
            }
        },
        team: {
            validateSnowflake<T extends string>(name: T){
                return bigintString(name).refine(
                    async snowflake => await client.team.findUnique({ where: { snowflake }, select: { _count: true }}),
                    snowflake => ({ message: `No team with snowflake "${snowflake}" found.`})
                )
            },
            fetch<T extends Prisma.TeamSelect>(name: string, properties: T){
                return bigintString(name)
                    .transform(async snowflake => await client.team.findUnique({ where: { snowflake }, select: properties }) ?? snowflake)
                    .refine(
                        <T>(a: T): a is Exclude<T, bigint> => typeof a !== 'bigint',
                        snowflake => ({ message: `No team with snowflake "${snowflake}" found.` })
                    )
            }
        },
        division: {
            validateSnowflake<T extends string>(name: T){
                return bigintString(name).refine(
                    async snowflake => await client.division.findUnique({ where: { snowflake }, select: { _count: true }}),
                    snowflake => ({ message: `No division with snowflake "${snowflake}" found.`})
                )
            }
        }
    }
}))
