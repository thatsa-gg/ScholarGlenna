import { Database, UUID, getRedisClient } from '@glenna/common'
import { reauthorizeUser, type Authorization } from '../auth'
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
    const redis = await getRedisClient()
    const sessionID = UUID.create() as SessionID
    const [ accessKey, sessionKey ] = getKeys(sessionID)
    const discordUser = await getUserInfo(authorization.access_token)
    const appProfile = await Database.Profiles.import(discordUser)
    await Promise.all([
        redis.set(accessKey, authorization.access_token, { EX: authorization.expires_in }),
        redis.hSet(sessionKey, {
            [FIELD_PROFILE_ID]: appProfile.profile_id,
            [FIELD_REFRESH_TOKEN]: authorization.refresh_token
        }),
        redis.expire(sessionKey, SESSION_EXPIRATION_DURATION_SECONDS),
    ])
    return {
        id: sessionID,
        profileId: appProfile.profile_id,
        accessToken: authorization.access_token,
        expiration: new Date(Date.now() + SESSION_EXPIRATION_DURATION_SECONDS * 1000),
    }
}

export async function getSession(sessionID: string): Promise<Session | null> {
    const redis = await getRedisClient()
    const [ accessKey, sessionKey ] = getKeys(sessionID as SessionID)
    const [ accessToken, sessionData ] = await Promise.all([
        redis.get(accessKey),
        redis.hmGet(sessionKey, [ FIELD_REFRESH_TOKEN, FIELD_PROFILE_ID ])
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
    const redis = await getRedisClient()
    const [ accessKey, sessionKey ] = getKeys(sessionID)
    if(!refreshToken){
        await redis.del([ accessKey, sessionKey ])
        throw new Error("Could not refresh session. Please log in again.")
    }

    const authorization = await reauthorizeUser(refreshToken)
    await redis.set(accessKey, authorization.access_token, { EX: authorization.expires_in })
    if(authorization.refresh_token){
        await Promise.all([
            redis.hSet(sessionKey, FIELD_REFRESH_TOKEN, authorization.refresh_token),
            redis.expire(sessionKey, SESSION_EXPIRATION_DURATION_SECONDS),
        ])
    }

    return {
        id: sessionID, profileId,
        accessToken: authorization.access_token
    }
}

export async function destroySession(sessionID: string): Promise<void> {
    const redis = await getRedisClient()
    await redis.del(getKeys(sessionID as SessionID))
}
