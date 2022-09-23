import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const prerender = false
export const load: LayoutServerLoad = async ({ url, parent, cookies }) => {
    const { user } = await parent()
    if(!user){
        // TODO: use login interrim page instead of setting this here
        // TODO: use state in oauth request to track session across login boundary?
        cookies.set('nav_after_login', url.toString(), {
            path: '/',
            expires: new Date(new Date().getTime() + 10*60*1000)
        })
        throw redirect(302, '/')
    }

    return { user }
}
