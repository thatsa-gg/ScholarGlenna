import { redirect, type RequestHandler } from '@sveltejs/kit'
import { AUTHORIZATION_URI, OAUTH_CLIENT_ID } from '$lib/auth'

export const GET: RequestHandler = async () => {
    const params = new URLSearchParams()
    params.append(`client_id`, OAUTH_CLIENT_ID)
    params.append(`permissions`, '268454992') //412317240512
    params.append(`scope`, `bot applications.commands`)
    throw redirect(302, `${AUTHORIZATION_URI}?${params}`)
}
