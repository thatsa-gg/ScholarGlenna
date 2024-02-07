import { redirect } from "@sveltejs/kit"
import { Profile } from "$lib/server/database"
import type { DatabaseConnection } from "slonik"
import { Session } from "./session"

export namespace User {
    export async function lookupSession(cache: Redis, connection: DatabaseConnection, sessionId: string | undefined): Promise<Nullable<Glenna.SessionUser>> {
        // if there is no session, there's no data to load
        if(undefined == sessionId)
            return null

        // if there is a session cookie, but not a valid session,
        // force a sign-out to clear it.
        const session = await Session.get(cache, sessionId)
        if(null == session){
            redirect(303, "/auth/signout")
        }

        // if there is a valid session, but no profile attached,
        // force a sign-out to clear it.
        const profile = await Profile.fromSession(connection, session)
        if(null == profile){
            redirect(303, "/auth/signout")
        }

        return profile
    }
}
