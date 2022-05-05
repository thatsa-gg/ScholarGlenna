import fastify from 'fastify'
import { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } from '@glenna/common'
import fetch from 'node-fetch'
import { createReadStream } from 'fs'
import { resolve } from '@glenna/util'

export const Port = 8080
export const App = fastify({ logger: true })
App.get('/', async ({ query }, response) => {
    let body = `<a href="https://discord.com/api/oauth2/authorize?client_id=970400237514539099&redirect_uri=http%3A%2F%2Flocalhost%3A8080&response_type=code&scope=identify&prompt=none">login</a>`
    const { code } = query as { code?: string }
    if(code){
        try {
            const oauthRequest = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: OAUTH_CLIENT_ID,
                    client_secret: OAUTH_CLIENT_SECRET,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: `http://localhost:${Port}`,
                    scope: 'identify'
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            })
            const oauthData = await oauthRequest.json() as any
            const userRequest = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${oauthData.token_type} ${oauthData.access_token}`
                }
            })
            const userdata = await userRequest.json() as any
            body = `Hello ${userdata.username}!<br/><img src="https://cdn.discordapp.com/avatars/${userdata.id}/${userdata.avatar}.png?size=64"/>`
        } catch(error){
            console.error(error)
        }
    }
    return response
        .type('text/html')
        .send(`<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Glenna</title>
    </head>
    <body>${body}</body>
</html>
`)
})

export async function listen(): Promise<string> {
    const addr = await App.listen(Port)
    console.log(`Listening on ${addr}`)
    return addr
}
