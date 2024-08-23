import type { APIGuildMemberWithUser } from "$lib/server/discord"
import type { APIGuild } from "@discordjs/core"
import { Guild } from "../../schema"
import { Team } from "../team"
import { TeamKind } from "../../types"
import { Role } from "../role"
import { setPermission } from "./setPermission"

function guildAcronym(name: string){
    return name.replace(/'s /g, ' ')
        .replace(/\w+/g, e => e[0]!)
        .replace(/\s/g, '')
}

export async function create(
    connection: DatabaseConnection,
    guild: APIGuild,
    owner: APIGuildMemberWithUser
){
    return await connection.transaction(async transact => {
        const entry = await transact.one(Guild.Insert({
            DiscordId: guild.id,
            Name: guild.name,
            Acronym: guildAcronym(guild.name),
            Icon: guild.icon ?? null,
            VanityCode: guild.vanity_url_code ?? null,
            LookupAlias: BigInt(guild.id).toString(36),
            Description: guild.description,
        }, { guildId: "GuildId" }))

        const team = await Team.Create(connection, entry, {
            name: "Management Team",
            kind: TeamKind.Management
        })

        const roles = await Role.CreateGuildRoles(connection, entry, team)
        await Team.SetPermission(transact, team, {
            PermissionRead: roles.managementMember,
        })
        await setPermission(transact, entry, {
            PermissionRead: roles.anyGuildMember,
            PermissionUpdate: roles.managementOwner,
            PermissionTeamCreateDelete: roles.managementOfficer,
            PermissionTeamDefaultUpdate: roles.managementMember,
        })
    })
}
