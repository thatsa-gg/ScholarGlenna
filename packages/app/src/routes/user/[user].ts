import type { RequestHandler } from "@sveltejs/kit"
type Params = { user: string }
type Output = { user: string }
export const get: RequestHandler<Params, Output> = async ({ params }) => {
    return { body: { user: params.user }}
}
