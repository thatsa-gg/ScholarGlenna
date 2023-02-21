import { Prisma } from '../../generated/client/index.js'
import { z } from 'zod'
import type { Guild } from '@glenna/discord'

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
                    async snowflake => await client.guild.findUnique({ where: { snowflake }, select: { id: true }}),
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
            },
            lookupOrThrow<T extends Prisma.GuildSelect>(guild: Guild, select: T){
                return client.guild.findUniqueOrThrow({
                    where: {
                        snowflake: BigInt(guild.id)
                    }, select
                })
            }
        },
        team: {
            validateSnowflake<T extends string>(name: T){
                return bigintString(name).refine(
                    async snowflake => await client.team.findUnique({ where: { snowflake }, select: { id: true }}),
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
            validateSnowflake(name: string){
                return bigintString(name).refine(
                    async snowflake => await client.division.findUnique({ where: { snowflake }, select: { id: true }}),
                    snowflake => ({ message: `No division with snowflake "${snowflake}" found.`})
                )
            },
            fetch<T extends Prisma.DivisionSelect>(name: string, properties: T){
                return bigintString(name)
                    .transform(async snowflake => await client.division.findUnique({ where: { snowflake }, select: properties }) ?? snowflake)
                    .refine(
                        <T>(a: T): a is Exclude<T, bigint> => typeof a !== 'bigint',
                        snowflake => ({ message: `No team with snowflake "${snowflake}" found.` })
                    )
            }
        }
    }
}))
