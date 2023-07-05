import { redirect, type RequestHandler } from '@sveltejs/kit'
import { OAUTH_CLIENT_ID } from '$lib/server'
import { OAuth2Routes, OAuth2Scopes, PermissionsBitField } from '@glenna/discord'

// build out the URL params in a static context here
const inviteParams = new URLSearchParams()
inviteParams.append(`client_id`, OAUTH_CLIENT_ID)
inviteParams.append(`permissions`, (
    PermissionsBitField.Flags.AddReactions
    | PermissionsBitField.Flags.ViewChannel // and read the messages therein
    | PermissionsBitField.Flags.AttachFiles
    | PermissionsBitField.Flags.SendMessages
    | PermissionsBitField.Flags.SendMessagesInThreads
    | PermissionsBitField.Flags.EmbedLinks // auto-create embeds from posted links
    | PermissionsBitField.Flags.AttachFiles
    | PermissionsBitField.Flags.UseExternalEmojis
    | PermissionsBitField.Flags.UseExternalStickers
    | PermissionsBitField.Flags.ChangeNickname // change own nickname
    | PermissionsBitField.Flags.CreatePublicThreads
).toString())
inviteParams.append(`scope`, [
    OAuth2Scopes.Bot,
    OAuth2Scopes.ApplicationsCommands,
].join(" "))

// generate the final URL so we don't need to do it again
const inviteUrl = `${OAuth2Routes.authorizationURL}?${inviteParams}`

// Give people an invite link so they can add the bot to their server
export const GET = (async () => {
    throw redirect(302, inviteUrl)
}) satisfies RequestHandler
