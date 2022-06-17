import { client } from './redis'

export type SessionID = string & { __TYPE__: 'SessionID' }
export function createSession(authToken: string, refreshToken: string): SessionID {
    // TODO
    return '' as SessionID
}
export function refreshSession(sessionId: SessionID){
    // TODO
}
export function destroySession(sessionId: SessionID){
    // TODO
}
export function getSession(sessionId: SessionID){

}
