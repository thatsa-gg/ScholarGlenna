import { redirect } from '@sveltejs/kit'

export async function GET(){
    throw redirect(308, `/-/dashboard`)
}