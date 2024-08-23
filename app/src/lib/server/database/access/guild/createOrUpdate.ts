import type { APIGuild } from "discord-api-types/v10"
import { Discord, type APIGuildMemberWithUser } from "../../../discord"
import { Guilds } from "../../helpers"
import { batch } from "$lib/server"
import { create } from "./create"

export async function createOrUpdate(
    connection: DatabaseConnection,
    guild: APIGuild,
    owner: APIGuildMemberWithUser
): Promise<void> {
    // yes this really is the best way to do this
    const guildMembers = await Discord.fetchAllMembers(guild)

    if(!await connection.exists(Guilds.ByDiscordId(guild))){
        const entry = await create(connection, guild, owner)
        await batch(Array.from(guildMembers.values()), 250, async members => {

        })
    }
}
