import type { LayoutLoad } from "./$types"
import UserLocalHeader from "./UserLocalHeader.svelte"

export const load = (async ({ parent }) => {
    const data = await parent()
    return {
        ...data,
        _components: {
            localHeader: [
                UserLocalHeader,
                {
                    user: data.params.user
                }
            ]
        }
    }
}) satisfies LayoutLoad
