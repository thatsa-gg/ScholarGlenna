import type { GetSession } from '@sveltejs/kit'
import type { User } from './lib/user'
import { parse } from 'cookie'

/*export const handle: Handle = async ({ event, resolve }) => {
    const cookies = parse(event.request.headers.get('cookie') ?? '')
    event.locals['access_token'] = cookies['access_token']
    return resolve(event)
}*/

export const getSession: GetSession = async event => {
    const { request } = event
    const { headers } = request
    const cookies = parse(event.request.headers.get('cookie') ?? '')
    const refresh_token = cookies['refresh_token']
    let access_token = cookies['access_token']
    console.log({ headers })
    if(refresh_token && !access_token){
        const request = await fetch(`http://localhost:8080/api/login/refresh?code=${refresh_token}`)
        console.log('refreshing:',request.status)
        const response = await request.json()
        console.log('refresh:',response)
        if(response.access_token){
            access_token = response.access_token
        }
    }
    if(access_token){
        const request = await fetch(`https://discord.com/api/v10/users/@me`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        const response = await request.json()
        console.log({ response })
        if(response.id){
            return {
                user: {
                    id: response.id,
                    username: response.userName,
                    avatar: response.avatar,
                    discriminator: response.discriminator
                } as User
            }
        }
    }
    return {
        user: false
    }
}
