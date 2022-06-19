import type { UUID } from './UUID'
import type { Authorization } from './auth'
import { createUUID } from './UUID'
import { client } from './redis'
import { Users } from './database'
import { getUserInfo } from './discord-rest'

export class Session {
    id: number = 0
    userId: number = 0
    accessToken: string = ''
    refreshToken: string = ''
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
export async function createSession(authorization: Authorization): Promise<Session> {
    const sessionID = createUUID() as SessionID
    const [ accessKey, refreshKey, userKey ] = getKeys(sessionID)
    const discordUser = await getUserInfo(authorization.access_token)
    const appUser = await Users.findOrCreate(discordUser)
    client.set(accessKey, authorization.access_token)
    client.set(refreshKey, authorization.refresh_token)
    client.set(userKey, appUser.id)
    client.expire(accessKey, authorization.expires_in)
    return {
        id: sessionID,
        userId: appUser.id,
        accessToken: authorization.access_token,
        refreshToken: authorization.refresh_token,
    }
}
export async function refreshSession(sessionId: Session): Promise<Session>{
    // TODO
    return null!
}
export function destroySession(sessionId: Session){
    // TODO
}
export function getSession(sessionId: string): Promise<Session> {
    // TODO
    return null!
}
