import type { Actions } from './$types'
export const actions: Actions = {
    default: async event => {
        const user = event
        return { success: true }
    }
}
