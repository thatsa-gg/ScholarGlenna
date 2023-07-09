import type { LayoutLoad } from "./$types"
import UserLocalHeader from "$lib/components/headers/UserLocalHeader.svelte"

export const load = (async ({ parent }) => {
    const data = await parent()
    return {
        ...data,
        _components: {
            localHeader: [
                UserLocalHeader,
                {
                    profile: data.params.profile,
                    ownProfile: data.params.profile.alias === data.params.currentUser.alias
                }
            ]
        }
    }
}) satisfies LayoutLoad
