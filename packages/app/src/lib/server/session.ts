import { reauthorizeUser, type Authorization } from '@glenna/auth'
import { Discord, Routes, type APIUser } from '@glenna/discord'
import { database, cache } from './index.js'
import { v4 as uuid } from 'uuid'

export interface Session {
    id: string
    profileId: number
    accessToken: string
}

export const SESSION_EXPIRATION_DURATION_SECONDS = 30 * 24 * 60 * 60

export async function createSession(authorization: Authorization): Promise<Session & { expiration: Date }> {
    const client = Discord.Rest.createUserClient(authorization.accessToken)
    const user = await client.get(Routes.user()) as APIUser
    const profile = await database.profile.import(user)
    const id = uuid()

    await cache.client.pipeline()
        .set(`session:access:${id}`, authorization.accessToken, "EX", authorization.expiresIn)
        .hset(`session:data:${id}`, { profile: profile.id, refresh: authorization.refreshToken })
        .expire(`session:data:${id}`, SESSION_EXPIRATION_DURATION_SECONDS)
        .exec()

    return {
        id,
        profileId: profile.id,
        accessToken: authorization.accessToken,
        expiration: new Date(Date.now() + SESSION_EXPIRATION_DURATION_SECONDS * 1000),
    }
}

export async function getSession(sessionID: string): Promise<Session | null> {
    const accessToken = await cache.client.get(`session:access:${sessionID}`)
    const [ profile, refresh ] = await cache.client.hmget(`session:data:${sessionID}`, 'profile', 'refresh')
    if(!profile)
        return null
    const profileId = Number.parseInt(profile)
    if(!accessToken)
        return await refreshSession(sessionID, profileId, refresh)
    return { id: sessionID, profileId, accessToken }
}

export async function refreshSession(sessionID: string, profileId: number, refreshToken: string | null): Promise<Session> {
    if(null === refreshToken){
        await cache.client.del(`session:access:${sessionID}`, `session:data:${sessionID}`)
        throw new Error("Could not refresh session. Please log in again.")
    }
    const authorization = await reauthorizeUser(refreshToken)

    await cache.client.pipeline()
        .set(`session:access:${sessionID}`, authorization.accessToken, "EX", authorization.expiresIn)
        .hset(`session:data:${sessionID}`, { refresh: authorization.refreshToken })
        .exec()

    return {
        id: sessionID, profileId,
        accessToken: authorization.accessToken
    }
}

export async function destroySession(sessionID: string){
    await cache.client.del(`session:access:${sessionID}`, `session:data:${sessionID}`)
}
