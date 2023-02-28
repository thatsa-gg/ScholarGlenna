import { redirect, type RequestHandler } from '@sveltejs/kit'
import { OAUTH_CLIENT_ID } from '$lib/server'
import { OAuth2Routes, OAuth2Scopes, PermissionsBitField } from '@glenna/discord'

export const GET: RequestHandler = async () => {
    const params = new URLSearchParams()
    params.append(`client_id`, OAUTH_CLIENT_ID)
    params.append(`permissions`, (
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
    params.append(`scope`, [
        OAuth2Scopes.Bot,
        OAuth2Scopes.ApplicationsCommands,
    ].join(" "))
    throw redirect(302, `${OAuth2Routes.authorizationURL}?${params}`)
}
