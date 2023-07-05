import type { LayoutServerLoad } from "./$types"
import UserLocalHeader from "./UserLocalHeader.svelte"

export const load = (async ({ parent }) => {
    const data = await parent()
    return {
        ...data,
        _components: {
            localHeader: [
                UserLocalHeader,
                {}
            ]
        }
    }
}) satisfies LayoutServerLoad
