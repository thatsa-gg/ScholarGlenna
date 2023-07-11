import { redirect, type RequestHandler } from '@sveltejs/kit'
import { OAUTH_CLIENT_ID } from '$env/static/private'
import { OAuth2Routes, OAuth2Scopes, PermissionFlagsBits } from 'discord-api-types/v10'

// build out the URL params in a static context here
const inviteParams = new URLSearchParams()
inviteParams.append(`client_id`, OAUTH_CLIENT_ID)
inviteParams.append(`permissions`, (
    PermissionFlagsBits.AddReactions
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
