import type { Guild as DiscordGuild, Role as DiscordRole } from 'discord.js'
import type { Prisma, Guild, GuildMember, GuildRole } from '../../generated/client'
import type { Database } from '.'

export type GuildDeletionSummary = { id: number, snowflake: bigint, name: string }
export class Guilds {
    #database: Database
    constructor(database: Database){ this.#database = database }

    async import(sources: DiscordGuild[], options?: { replace: true }): Promise<Guild[]> {
        const {
            replace = false
        } = options ?? {}
        return await this.#database.Client.$transaction<Guild[]>(async client => {
            const Import = this.#database.Import
            await client.importGuilds.createMany({
                data: sources.map(guild => {
                    const snowflake = BigInt(guild.id)
                    return {
                        snowflake,
                        vanity: guild.vanityURLCode,
                        alias: snowflake.toString(36),
                        icon: guild.icon,
                        description: guild.description,
                        preferred_locale: guild.preferredLocale
                    }
                })
            })
            const sourceMap = new Map(sources.map(source => [source.id, source]))
            const guilds = await Import.importGuilds(client, { replace })

            for(const [id, guild] of guilds){
                const source = sourceMap.get(id)
                if(!source)
                    throw new Error("Could not find matching guild source.")
                // check that manager/moderator roles still exist.
                if(null !== guild.moderator_role || null !== guild.manager_role){
                    const data: Prisma.GuildUpdateInput = {}
                    if(null !== guild.moderator_role){
                        const role = await source.roles.fetch(guild.moderator_role.toString())
                        if(null === role)
                            data.moderator_role = null
                    }
                    if(null !== guild.manager_role){
                        const role = await source.roles.fetch(guild.manager_role.toString())
                        if(null === role)
                            data.manager_role = null
                    }
                    if(Object.keys(data).length > 0){
                        data.updated_at = new Date()
                        await client.guild.update({ where: { guild_id: guild.guild_id }, data })
                    }
                }

                // update team data for relevant teams
                const teams = await client.team.findMany({ where: { guild_id: guild.guild_id, role: { not: null }}})
                const roles = new Map<string, DiscordRole>()
                for(const team of teams){
                    if(null !== team.role || null !== team.channel){
                        const data: Prisma.TeamUpdateInput = {}
                        if(null !== team.channel && null === await source.channels.fetch(team.channel.toString()))
                            data.channel = null
                        if(null !== team.role){
                            const role = await source.roles.fetch(team.role.toString())
                            if(null === role)
                                data.role = null
                            else {
                                if(role.icon !== team.icon)
                                    data.icon = role.icon
                                if(role.color !== team.color)
                                    data.color = role.color
                                await client.importTeamMembers.createMany({
                                    data: role.members.map(member => ({
                                        team_id: team.team_id,
                                        snowflake: BigInt(member.id)
                                    }))
                                })
                            }
                        }
                        if(Object.keys(data).length > 0){
                            data.updated_at = new Date()
                            await client.team.update({ where: { team_id: team.team_id }, data })
                        }
                    }
                }

                // load member data (need to fetch all so we can create GuildMembers for Users that just joined)
                const managers = new Set(null === guild.manager_role ? null : Array.from(roles.get(guild.manager_role.toString())!.members, ([,member]) => member.id))
                const moderators = new Set(null === guild.moderator_role ? null : Array.from(roles.get(guild.moderator_role.toString())!.members, ([,member]) => member.id))
                for(let frame = await source.members.list({ limit: 100 });
                    frame.size > 0;
                    frame = await source.members.list({ limit: 100, after: frame.at(-1)?.id }))
                    await client.keepGuildMember.createMany({ data: Array.from(frame, ([id, member]) => ({
                        guild_id: guild.guild_id,
                        snowflake: BigInt(id),
                        username: member.user.username,
                        discriminator: Number.parseInt(member.user.discriminator),
                        name: member.nickname,
                        avatar: member.avatar,
                        role: member.id === source.ownerId ? 'Owner'
                            : moderators.has(member.id) ? 'Moderator'
                            : managers.has(member.id) ? 'Manager'
                            : null
                    }))})
            }
            await Import.importMembers(client)
            await this.#database.GuildMembers.prune({ client })
            await this.#database.Users.prune({ client })
            return sources.map(source => guilds.get(source.id)!)
        })
    }
}
