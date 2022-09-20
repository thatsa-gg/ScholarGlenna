import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
export const load: LayoutServerLoad = async ({ parent }) => {
    const { user } = await parent()
    if(!user)
        throw error(401)
    return { user }
}
