import { redirect } from "@sveltejs/kit"
import { OAuth2Routes, OAuth2Scopes, PermissionFlagsBits } from "discord-api-types/v10"
import { Http } from "$lib/server"
import { OAUTH_CLIENT_ID } from "$lib/server/env"

const params = new URLSearchParams()
params.append("client_id", OAUTH_CLIENT_ID)
params.append("scope", [
    OAuth2Scopes.Bot,
    OAuth2Scopes.ApplicationsCommands
].join(" "))
params.append("permissions", (0n
    | PermissionFlagsBits.AddReactions
    | PermissionFlagsBits.ViewChannel // and read the messages therein
    | PermissionFlagsBits.AttachFiles
    | PermissionFlagsBits.SendMessages
    | PermissionFlagsBits.SendMessagesInThreads
    | PermissionFlagsBits.EmbedLinks // auto-create embeds from posted links
    | PermissionFlagsBits.AttachFiles
    | PermissionFlagsBits.UseExternalEmojis
    | PermissionFlagsBits.UseExternalStickers
    | PermissionFlagsBits.ChangeNickname // change own nickname
    | PermissionFlagsBits.CreatePublicThreads
).toString())
const inviteUrl = `${OAuth2Routes.authorizationURL}?${params}`

export async function GET(){
    return redirect(Http.Code.FoundElsewhere, inviteUrl)
}
