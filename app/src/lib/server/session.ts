import { REST } from "@discordjs/rest"
import { API } from "@discordjs/core"
import { v4 as uuid } from "uuid"
import { Cache } from "./cache"
import { Profile } from "./database"
import { Auth, type Authorization } from "./auth"

export namespace Session {
    const SESSION_EXPIRATION_DURATION_SECONDS = 30 * 24 * 60 * 60 // 30 days
    export async function create(connection: DatabaseConnection, cache: Redis, authorization: Authorization): Promise<Glenna.Session & { expiration: Date }> {
        const client = new REST({ authPrefix: "Bearer", version: "10" })
            .setToken(authorization.accessToken)
        const api = new API(client)
        const user = await api.users.getCurrent()
        const profile = await Profile.getOrCreate(connection, user)
        const id = uuid()

        await cache.pipeline()
            .set(Cache.Key.sessionAccess(id), authorization.accessToken, "EX", authorization.expiresIn)
            .hset(Cache.Key.sessionData(id), {
                [Cache.Property.Session.Profile]: profile.profileId.toString(),
                [Cache.Property.Session.User]: profile.userId.toString(),
                [Cache.Property.Session.Refresh]: authorization.refreshToken
            })
            .expire(Cache.Key.sessionData(id), SESSION_EXPIRATION_DURATION_SECONDS)
            .exec()

        return {
            id,
            profileId: profile.profileId,
            userId: profile.userId,
            accessToken: authorization.accessToken,
            expiration: new Date(Date.now() + SESSION_EXPIRATION_DURATION_SECONDS * 1000),
        }
    }

    export async function destroy(cache: Redis, sessionId: string){
        await cache.del(
            Cache.Key.sessionAccess(sessionId),
            Cache.Key.sessionData(sessionId)
        )
    }

    export async function get(cache: Redis, sessionId: string): Promise<null | Glenna.Session> {
        const [ profile, user, refreshToken ] = await cache.hmget(Cache.Key.sessionData(sessionId),
            Cache.Property.Session.Profile,
            Cache.Property.Session.User,
            Cache.Property.Session.Refresh)
        if(!profile)
            return null
        if(!user)
            return null

        const profileId = Number.parseInt(profile)
        const userId = Number.parseInt(user)
        const accessToken = await cache.get(Cache.Key.sessionAccess(sessionId))
        if(accessToken)
            return { id: sessionId, userId, profileId, accessToken }
        else
            return await refresh(cache, sessionId, userId, profileId, refreshToken)
    }

    export async function refresh(cache: Redis, sessionId: string, userId: number, profileId: number, refreshToken: string | null): Promise<Glenna.Session> {
        if(null === refreshToken){
            await cache.del(Cache.Key.sessionAccess(sessionId), Cache.Key.sessionData(sessionId))
            throw new Error("Could not refresh session. Please log in again.")
        }
        const authorization = await Auth.reauthorizeUser(refreshToken)

        await cache.pipeline()
            .set(Cache.Key.sessionAccess(sessionId), authorization.accessToken, "EX", authorization.expiresIn)
            .hset(Cache.Key.sessionData(sessionId), {
                [Cache.Property.Session.Refresh]: authorization.refreshToken
            })
            .exec()

        return {
            id: sessionId, profileId, userId,
            accessToken: authorization.accessToken
        }
    }
}
