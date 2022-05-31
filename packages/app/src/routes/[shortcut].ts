import type { ParamMatcher, RequestHandler } from "@sveltejs/kit"

type Params = { id: string }
export const match: ParamMatcher = (param) => {
    // TODO: check DB
    return false
}

export const get: RequestHandler<Params> = (event) => {
    // TODO: perform redirects for some guilds (admin-added)
    return {
        status: 302, // HTTP Found
        headers: {
            location: `/target`
        }
    }
}
