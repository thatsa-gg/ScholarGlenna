import { REST } from "@discordjs/rest"
import { API } from "@discordjs/core"
import { DISCORD_TOKEN } from "./env.js"
import type { APIGuild, APIGuildMember } from "discord-api-types/v10"
import type { Authorization } from "./auth.js"

export type APIGuildMemberWithUser = APIGuildMember & Required<Pick<APIGuildMember, 'user'>>
export function isGuildMemberWithUser(candidate: APIGuildMember): candidate is APIGuildMemberWithUser { return undefined != candidate.user }
export namespace Discord {
    export const Rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN)
    export const Api = new API(Rest)

    export async function fetchAllMembers(guild: Pick<APIGuild, 'id'>): Promise<Map<string, APIGuildMemberWithUser>> {
        const allMembers = new Map<string, APIGuildMemberWithUser>()
        const limit = 1000 // max from the API
        let after: string | undefined = undefined
        do {
            const batch = await Api.guilds.getMembers(guild.id, { after, limit })
            for(const member of batch){
                if(!isGuildMemberWithUser(member)){
                    throw "hissy fit"
                }
                allMembers.set(member.user.id, member)
            }
            after = batch.at(-1)?.user?.id
        } while(after)
        return allMembers
    }

    export function User(authorization: Authorization){
        return new API(new REST({ authPrefix: "Bearer", version: "10" })
            .setToken(authorization.accessToken))
    }
}
