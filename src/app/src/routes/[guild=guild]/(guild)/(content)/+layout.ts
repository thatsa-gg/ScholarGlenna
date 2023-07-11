import type { LayoutLoad } from "./$types"
import GuildLocalHeader from "./GuildLocalHeader.svelte"

export const load = (async () => {
    return {
        _components: {
            localHeader: [
                GuildLocalHeader,
                {

                }
            ]
        }
    }
}) satisfies LayoutLoad
