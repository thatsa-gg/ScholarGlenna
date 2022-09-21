import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const prerender = false
export const load: LayoutServerLoad = async ({ parent }) => {
    const { user } = await parent()
    if(!user)
        throw redirect(302, '/')

    return { user }
}
