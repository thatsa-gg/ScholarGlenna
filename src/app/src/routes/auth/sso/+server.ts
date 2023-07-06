import type { RequestHandler } from '@sveltejs/kit'
import { redirectAuth } from '$lib/server/auth'
import { z } from 'zod'

const validateUrl = z.string().regex(/\/.*/).catch(`/-/dashboard`).default(`/-/dashboard`)

// used when people try to log in
// redirect_uri is an optional parameter to send people back where they came from
// (default is the dashboard)
export const GET = (async ({ url }) => {
    throw await redirectAuth(validateUrl.parse(decodeURIComponent(url.searchParams.get('redirect_uri') ?? "")))
}) satisfies RequestHandler
