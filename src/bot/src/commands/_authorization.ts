import type { ChatInputCommandInteraction } from '@glenna/discord'
import type { DivisionPermissions, GuildPermissions, TeamPermissions } from '@glenna/prisma'
import { database } from '../util/database.js'
import { asArray, type MaybeArray } from '@glenna/util'

export type TeamAuthorization<Keys extends string> = { key: Keys, team: MaybeArray<TeamPermissions> }
export type DivisionAuthorization<Keys extends string> = { key: Keys, division: MaybeArray<DivisionPermissions> }
export type GuildAuthorization = { guild: MaybeArray<GuildPermissions> }
export type Authorization<Keys extends string> = TeamAuthorization<Keys> | DivisionAuthorization<Keys> | GuildAuthorization

export function isTeamAuthorization<K extends string>(c: Authorization<K> | undefined): c is TeamAuthorization<K> {
    return !!c && 'team' in c
}
function isDivisionAuthorization<K extends string>(c: Authorization<K>): c is DivisionAuthorization<K> {
    return 'division' in c
}
function isGuildAuthorization(c: Authorization<string>): c is GuildAuthorization {
    return 'guild' in c
}

export async function authorize<K extends string>(interaction: ChatInputCommandInteraction, target: Authorization<K>, input: Record<string, any>){
    const source = interaction.guild
    if(null === source)
        return false
    const actor = interaction.user
    if(null === actor)
        return false
    if(isGuildAuthorization(target)){
        const guild = await database.guild.findUniqueOrThrow({
            where: { snowflake: BigInt(source.id) },
            select: { isAuthorized: true }
        })
        return await guild.isAuthorized(asArray(target.guild), actor)
    } else if(isDivisionAuthorization(target)){
        const division = await database.division.findUniqueOrThrow({
            // guild snowflake included as extra safety
            where: { snowflake: BigInt(input[target.key]), guild: { snowflake: BigInt(source.id) }},
            select: { isAuthorized: true }
        })
        return await division.isAuthorized(asArray(target.division), actor)
    } else {
        const team = await database.team.findUniqueOrThrow({
            // guild snowflake included as extra safety
            where: { snowflake: BigInt(input[target.key]), guild: { snowflake: BigInt(source.id) }},
            select: { isAuthorized: true }
        })
        return await team.isAuthorized(asArray(target.team), actor)
    }
}
