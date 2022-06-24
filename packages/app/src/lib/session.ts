import { AppDataSource, UUID, RedisClient } from '@glenna/common'
import { reauthorizeUser, type Authorization } from './auth'
import { getUserInfo } from './discord-rest'

export interface Session {
    id: SessionID
    profileId: number
    accessToken: string
    expiration?: Date
}

const FIELD_PROFILE_ID = 'profileID'
const FIELD_REFRESH_TOKEN = 'refreshToken'
type Keys = [ accessKey: string, sessionKey: string ]
function getKeys(sessionID: SessionID): Keys {
    return [
        `session_access_${sessionID}`,
        `session_data_${sessionID}`
    ]
}
export type SessionID = UUID & { __TYPE__: 'SessionID' }
export const SESSION_EXPIRATION_DURATION_SECONDS = 30 * 24 * 60 * 60

export async function createSession(authorization: Authorization): Promise<Required<Session>> {
    const { Profiles } = await AppDataSource
    const sessionID = UUID.create() as SessionID
    const [ accessKey, sessionKey ] = getKeys(sessionID)
    const discordUser = await getUserInfo(authorization.access_token)
    const appProfile = await Profiles.findOrCreate(discordUser)
    await Promise.all([
        RedisClient.set(accessKey, authorization.access_token, { EX: authorization.expires_in }),
        RedisClient.hSet(sessionKey, {
            [FIELD_PROFILE_ID]: appProfile.id,
            [FIELD_REFRESH_TOKEN]: authorization.refresh_token
        }),
        RedisClient.expire(sessionKey, SESSION_EXPIRATION_DURATION_SECONDS),
    ])
    return {
        id: sessionID,
        profileId: appProfile.id,
        accessToken: authorization.access_token,
        expiration: new Date(Date.now() + SESSION_EXPIRATION_DURATION_SECONDS * 1000),
    }
}

export async function getSession(sessionID: string): Promise<Session | null> {
    const [ accessKey, sessionKey ] = getKeys(sessionID as SessionID)
    const [ accessToken, sessionData ] = await Promise.all([
        RedisClient.get(accessKey),
        RedisClient.hmGet(sessionKey, [ FIELD_REFRESH_TOKEN, FIELD_PROFILE_ID ])
    ])
    const [ refreshToken, profileId ] = sessionData
    if(!profileId)
        return null
    if(!accessToken)
        return await refreshSession(sessionID as SessionID, Number.parseInt(profileId), refreshToken)
    return {
        id: sessionID as SessionID,
        profileId: Number.parseInt(profileId),
        accessToken
    }
}

export async function refreshSession(sessionID: SessionID, profileId: number, refreshToken: string | null): Promise<Session> {
    const [ accessKey, sessionKey ] = getKeys(sessionID)
    if(!refreshToken){
        await RedisClient.del([ accessKey, sessionKey ])
        throw new Error("Could not refresh session. Please log in again.")
    }

    const authorization = await reauthorizeUser(refreshToken)
    await RedisClient.set(accessKey, authorization.access_token, { EX: authorization.expires_in })
    if(authorization.refresh_token){
        await Promise.all([
            RedisClient.hSet(sessionKey, FIELD_REFRESH_TOKEN, authorization.refresh_token),
            RedisClient.expire(sessionKey, SESSION_EXPIRATION_DURATION_SECONDS),
        ])
    }

    return {
        id: sessionID, profileId,
        accessToken: authorization.access_token
    }
}

export async function destroySession(sessionID: string): Promise<void> {
    await RedisClient.del(getKeys(sessionID as SessionID))
}
