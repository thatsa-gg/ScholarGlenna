import type { ParamMatcher } from "@sveltejs/kit"

const illegalGuildNames = new Set([
    '-',
    'api',
    'auth'
])
export const match = ((param) => {
    return !illegalGuildNames.has(param)
}) satisfies ParamMatcher
