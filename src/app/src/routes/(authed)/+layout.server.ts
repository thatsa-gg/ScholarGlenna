import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const prerender = false
export const load: LayoutServerLoad = async ({ parent }) => {
    const data = await parent()
    if(!data.user)
        throw redirect(302, '/api/login')
    return data
}
