import { Users, UUID } from '@glenna/common'
import { reauthorizeUser, type Authorization } from './auth'
import { client } from './redis'
import { getUserInfo } from './discord-rest'

export interface Session {
    id: SessionID
    userId: number
    accessToken: string
    expiration?: Date
}

type Keys = [ accessKey: string, refreshKey: string, userKey: string ]
function getKeys(sessionID: SessionID): Keys {
    return [
        `session_access_${sessionID}`,
        `session_refresh_${sessionID}`,
        `session_user_${sessionID}`
    ]
}
export type SessionID = UUID & { __TYPE__: 'SessionID' }
export const SESSION_EXPIRATION_DURATION_SECONDS = 30 * 24 * 60 * 60

export async function createSession(authorization: Authorization): Promise<Required<Session>> {
    const sessionID = UUID.create() as SessionID
    const [ accessKey, refreshKey, userKey ] = getKeys(sessionID)
    const discordUser = await getUserInfo(authorization.access_token)
    const appUser = await Users.findOrCreate(discordUser)
    await Promise.all([
        client.set(accessKey, authorization.access_token, { EX: authorization.expires_in }),
        client.set(refreshKey, authorization.refresh_token, { EX: SESSION_EXPIRATION_DURATION_SECONDS }),
        client.set(userKey, appUser.id, { EX: SESSION_EXPIRATION_DURATION_SECONDS }),
    ])
    return {
        id: sessionID,
        userId: appUser.id,
        accessToken: authorization.access_token,
        expiration: new Date(Date.now() + SESSION_EXPIRATION_DURATION_SECONDS * 1000),
    }
}

export async function getSession(sessionID: string): Promise<Session | null> {
    const [ accessKey, refreshKey, userKey ] = getKeys(sessionID as SessionID)
    const [ accessToken, refreshToken, userId ] = await Promise.all([
        client.get(accessKey),
        client.get(refreshKey),
        client.get(userKey),
    ])
    if(!userId)
        return null
    if(!accessToken)
        return await refreshSession(sessionID as SessionID, Number.parseInt(userId), refreshToken)
    return {
        id: sessionID as SessionID,
        userId: Number.parseInt(userId),
        accessToken
    }
}

export async function refreshSession(sessionID: SessionID, userId: number, refreshToken: string | null): Promise<Session> {
    const [ accessKey, refreshKey, userKey ] = getKeys(sessionID)
    if(!refreshToken){
        await client.del([ accessKey, refreshKey, userKey ])
        throw new Error("Could not refresh session. Please log in again.")
    }

    const authorization = await reauthorizeUser(refreshToken)
    await client.set(accessKey, authorization.access_token, { EX: authorization.expires_in })
    if(authorization.refresh_token){
        await Promise.all([
            client.set(refreshKey, authorization.refresh_token, { EX: SESSION_EXPIRATION_DURATION_SECONDS }),
            client.expire(userKey, SESSION_EXPIRATION_DURATION_SECONDS),
        ])
    }

    return {
        id: sessionID, userId,
        accessToken: authorization.access_token
    }
}

export async function destroySession(sessionID: string): Promise<void> {
    await client.del(getKeys(sessionID as SessionID))
}
