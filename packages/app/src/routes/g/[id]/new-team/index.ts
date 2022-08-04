import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async event => {
    return { status: 200 }
}

export const POST: RequestHandler = async event => {
    // TODO: validate team creation, create team
    return { status: 200 }
}
