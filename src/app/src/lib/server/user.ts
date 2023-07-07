import { redirect } from "@sveltejs/kit"
import { getSession } from "./session"
import { database } from "."

export type UserSessionData = {
    profile: {
        id: number
    }
    user: {
        id: number
        name: string
        alias: string
        avatar: string
    }
}

export async function getUserSessionData(sessionId: string | undefined): Promise<UserSessionData | null> {
    // if there is no session, there's no data to load
    if(!sessionId)
        return null

    // if there is a session cookie, but not a valid session, force a sign-out to clear it.
    const session = await getSession(sessionId)
    if(!session)
        throw redirect(303, '/auth/signout')

    const profile = await database.profile.findUnique({
        where: { id: session.profileId },
        select: {
            id: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    alias: true,
                    avatar: true,
                }
            }
        }
    })

    // if there is a valid session, but no profile attached, force a sign-out to clear it.
    if(!profile)
        throw redirect(303, `/auth/signout`)


    return {
        profile: {
            id: profile.id
        },
        user: {
            id: profile.user.id,
            name: profile.user.name,
            alias: profile.user.alias,
            avatar: profile.user.avatar
        }
    }
}
