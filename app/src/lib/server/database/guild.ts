import type { APIGuild, APIGuildMember } from "discord-api-types/v10"
import type { APIGuildMemberWithUser } from "../discord"
import { createSqlTag, type DatabaseTransactionConnection } from "slonik"
import { z } from "zod"
import { Role } from "./role"
import { Team } from "./team"
import { Discord } from "../discord"
import { TeamMember } from "./teammember"
import { GuildMember } from "./guildmember"
import { User } from "./user"
import { GuildTable, GuildReadView, GuildMemberTable, GuildInfoView, type PickColumns, ColumnSet, Column, type AllColumns, GuildUpdateView } from "./tables"
import { RoleKind, TeamKind } from "./types"
import { AppUrl, Database, batch } from "../index"

const common = new ColumnSet({
    // IDs
    ...GuildTable.GuildId.Set,
    ...GuildTable.DiscordId.Set,
    ...GuildTable.VanityCode.Set,
    ...GuildTable.LookupAlias.Set,

    // Properties
    ...GuildTable.Name.Set,
    ...GuildTable.Icon.Set,
    ...GuildTable.Description.Set,
    ...GuildTable.ServerRegion.Set,

    // Counts
    ...GuildInfoView.TeamCount.Set,
    ...GuildInfoView.LeagueCount.Set,
    ...GuildInfoView.MemberCount.Set,
})

const sql = createSqlTag({
    typeAliases: {
        void: z.object({}).strict(),
        guildId: z.object({
            guildId: GuildTable.GuildId.Type
        }).strict(),
        guild: common.Type.strict(),
        visibleGuild: common.Type.extend({
            isMember: z.boolean()
        }).strict(),
    }
})

function guildAcronym(name: string){
    return name.replace(/'s /g, ' ')
        .replace(/\w+/g, e => e[0]!)
        .replace(/\s/g, '')
}

function asGlennaGuild(guild: z.infer<typeof common['Type']> & { isMember?: boolean, canUpdate?: boolean }): Glenna.Guild {
    const data: Glenna.Guild = {
        guildId: guild.guildId,
        slug: guild.vanityCode ?? guild.lookupAlias,
        name: guild.name,
        description: guild.description,
        serverRegion: guild.serverRegion,
        count: {
            teams: guild.teamCount,
            leagues: guild.leagueCount,
            members: guild.memberCount,
        },
        url: {
            guild: AppUrl.guild(guild),
            icon: AppUrl.icon({ id: guild.discordId.toString(), iconHash: guild.icon }),
            invite: AppUrl.guildInvite(guild),
            logs: AppUrl.guildLogs(guild),
            apply: null,
            applications: null,
            teams: AppUrl.teams(guild),
            settings: AppUrl.guildSettings(guild),
        },
        permission: {
            update: guild.canUpdate ?? false
        },
    }
    if('isMember' in guild)
        data.isMember = guild.isMember
    return data
}

export namespace Guild {
    export async function createOrUpdate(
        connection: DatabaseConnection,
        guild: APIGuild,
        owner: APIGuildMemberWithUser
    ): Promise<void> {
        const guildMembers = await Discord.fetchAllMembers(guild) // yes this really is the best way to do this
        if(!await connection.exists(sql.typeAlias("guildId")`select guild_id as "guildId" from "app"."guild" where discord_id = ${guild.id}`)){
            const dbGuild = await create(connection, guild, owner)
            await batch([...guildMembers.values()], 250, async members => {
                // add guild member role for existing profiles
                await Role.addMissingGuildMemberRolesForNewGuild(connection, dbGuild, members)
            })
        } else {
            const dbGuild = await update(connection, guild, owner)
            const teams = await Team.getAllByDiscordGuild(connection, guild)
            const roles = new Set(teams.map(team => team.syncedRole?.toString())
                            .filter((a: string | undefined): a is string => a !== undefined))
            const membersByRole = new Map<string, APIGuildMemberWithUser[]>()
            for(const role of roles)
                membersByRole.set(role, [])
            for(const member of guildMembers.values()){
                const memberRoles = new Set(member.roles)
                for(const role of roles){
                    if(memberRoles.has(role)){
                        membersByRole.get(role)!.push(member)
                        memberRoles.delete(role) // prevent duplicates
                    }
                }
            }
            for(const team of teams){
                if(team.syncedRole){
                    const role = guild.roles.find(role => BigInt(role.id) == team.syncedRole)
                    if(role){
                        // the team has a role, and it's still present
                        await Team.setColorAndIcon(connection, team, role)
                        await TeamMember.setFromList(connection, team, membersByRole.get(role.id) ?? [])

                        // TODO: notify if a user was removed because
                        //       they're no longer in the discord
                    } else {
                        // the team had a role, but it was deleted
                        await Team.setRole(connection, team, null)
                        await TeamMember.removeAll(connection, team)

                        // if a team was unlinked from its role, it doesn't matter
                        // if any members left the discord or not
                    }
                } else {
                    const members = await TeamMember.getAllFromTeam(connection, team)
                    for(const member of members){
                        const guildMember = guildMembers.get(member.discordId.toString())
                        if(guildMember){
                            await GuildMember.createOrUpdateWithUser(connection, dbGuild, guildMember)
                        } else {
                            await TeamMember.remove(connection, member)
                            // TODO: notify that a member was removed because
                            //       they're no longer in the discord
                        }
                    }
                }
            }

            await GuildMember.prune(connection, guild)
            await User.prune(connection)
        }
    }

    export async function update(connection: DatabaseConnection, guild: APIGuild, owner: APIGuildMemberWithUser){
        return await connection.transaction(async transact => {
            const dbGuild = await transact.one(sql.typeAlias("guildId")`
                update ${GuildTable.Table} set ${GuildTable.All.Update({
                    lastSeen: Database.Now,
                    name: guild.name,
                    acronym: guildAcronym(guild.name),
                    icon: guild.icon ?? null,
                    vanityCode: guild.vanity_url_code ?? null,
                    description: guild.description ?? null,
                })}
                where ${GuildTable.MatchesDiscordId(guild)}
                returning ${GuildTable.GuildId.Returning()}
            `)

            const ownerGuildMember = await GuildMember.createOrUpdateWithUser(transact, dbGuild, owner)
            const managementTeam = await Team.getManagementTeam(transact, dbGuild)
            const ownerRole = await Role.getTeamRole(transact, managementTeam, RoleKind.TeamOwner)
            const [ existingOwner ] = await Role.getDirectUsers(transact, ownerRole)
            if(ownerGuildMember.userId !== existingOwner?.userId){
                const ownerTeamMember = await TeamMember.create(transact, managementTeam, ownerGuildMember)
                await TeamMember.setRole(transact, ownerTeamMember, RoleKind.TeamOwner)
                if(existingOwner)
                    await TeamMember.removeByUserId(transact, managementTeam, existingOwner)
            }

            return dbGuild
        })
    }

    export async function create(connection: DatabaseConnection, guild: APIGuild, owner: APIGuildMemberWithUser){
        return await connection.transaction(async transact => {
            const dbGuild = await transact.one(sql.typeAlias("guildId")`
                insert into ${GuildTable.Table}(
                    ${GuildTable.DiscordId.Insert()},
                    ${GuildTable.Name.Insert()},
                    ${GuildTable.Acronym.Insert()},
                    ${GuildTable.Icon.Insert()},
                    ${GuildTable.VanityCode.Insert()},
                    ${GuildTable.LookupAlias.Insert()},
                    ${GuildTable.Description.Insert()}
                )
                values (
                    ${guild.id},
                    ${guild.name},
                    ${guildAcronym(guild.name)},
                    ${guild.icon ?? null},
                    ${guild.vanity_url_code ?? null},
                    ${BigInt(guild.id).toString(36)},
                    ${guild.description}
                ) returning ${GuildTable.GuildId.Returning()}
            `)
            const managementTeam = await Team.create(transact, dbGuild, {
                name: "Management Team",
                kind: TeamKind.Management,
            })
            const roles = await Role.createGuildRoles(transact, dbGuild, managementTeam)
            await Team.setPermissions(transact, managementTeam, {
                read: roles.managementMember,
            })
            await Guild.setPermissions(transact, dbGuild, {
                read: roles.anyGuildMember,
                update: roles.managementOwner,
                teamCreateDelete: roles.managementOfficer,
                teamDefaultUpdate: roles.managementMember,
            })

            const ownerGuildMember = await GuildMember.createOrUpdateWithUser(transact, dbGuild, owner)
            const ownerTeamMember = await TeamMember.create(transact, managementTeam, ownerGuildMember)
            await TeamMember.setRole(transact, ownerTeamMember, RoleKind.TeamOwner)

            return dbGuild
        })
    }

    export async function get(connection: DatabaseConnection, guild: Pick<APIGuild, 'id'>){
        return await connection.maybeOne(sql.typeAlias("guild")`
            select
                ${GuildTable.GuildId.Select()},
                ${GuildTable.Name.Select()},
                ${GuildTable.VanityCode.Select()},
                ${GuildTable.LookupAlias.Select()}
            from ${GuildTable.Table}
            where ${GuildTable.DiscordId.Column} = ${guild.id}
        `)
    }

    export async function lookup(connection: DatabaseConnection, user: Nullable<Glenna.Id.User>, slug: string): Promise<Nullable<Glenna.Guild>> {
        const guild = await connection.maybeOne(sql.type(common.Type.extend({
            canUpdate: z.boolean()
        }))`
            select
                ${common.Select()},
                ${GuildUpdateView.HasPermission(user)} as "canUpdate"
            from ${GuildTable.Table}
                inner join ${GuildReadView.JoinViewToBaseTable}
                inner join ${GuildInfoView.JoinViewToGuild}
                left outer join ${GuildUpdateView.JoinViewToBaseTable}
            where ${GuildTable.MatchesSlug(slug)} and ${GuildReadView.HasPermission(user)}
            limit 1
        `)
        if(!guild)
            return null
        return asGlennaGuild(guild)
    }

    export async function setPermissions(
        connection: DatabaseTransactionConnection,
        guild: { guildId: number },
        permissions: AllColumns<typeof GuildTable['Permissions']>
    ){
        const set = GuildTable.Permissions.Update(permissions)
        if(!set)
            return
        await connection.query(sql.typeAlias("void")`
            update ${GuildTable.Table} set
                ${set}
            where guild_id = ${guild.guildId}
        `)
    }

    export async function getVisible(
        connection: DatabaseConnection,
        user: Nullable<Glenna.Id.User>
    ): Promise<Glenna.Guild[]> {
        const guilds = await connection.any(sql.typeAlias("visibleGuild")`
            select distinct
                ${common.Select()},
                ${GuildMemberTable.SelectIsMember()}
            from ${GuildTable.Table}
                inner join ${GuildReadView.JoinViewToBaseTable}
                inner join ${GuildInfoView.JoinViewToGuild}
                left outer join ${GuildMemberTable.JoinTableToReadView(user)}
            where ${GuildReadView.HasPermission(user)}
            order by ${GuildTable.Name.Column}
        `)
        return guilds.map(guild => asGlennaGuild(guild))
    }
}
