import { Cache } from "./cache.js"
import { v4 as uuid } from "uuid"
import { OAuth2Routes, OAuth2Scopes, RouteBases, Routes } from "discord-api-types/v10"

import type { Redis } from "ioredis"
import { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, SSO_RETURN_URI } from "./env.js"
import { z } from "zod"

async function newStateIdKey(cache: Redis){
    let id = uuid()
    while(await cache.exists(Cache.Key.oauth2Request(id)))
        id = uuid()
    return id
}

function maybeUrlToString(url: string | URL){
    if(typeof url === "string")
        return url
    return `${url.pathname}${url.search}`
}

const AuthorizationScopes = [
    OAuth2Scopes.Identify
].join(" ")

const AccessToken = z.object({
    token_type: z.string(),
    scope: z.string(),
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number()
})

const RefreshToken = z.object({
    token_type: z.string(),
    scope: z.string(),
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number()
})

export interface Authorization {
    accessToken: string
    refreshToken: string
    expiresIn: number
}

export namespace Auth {
    export async function authorizeUser(oauth2Code: string, state: string): Promise<Authorization> {
        // We can't use Discord.Api.oauth2 here because it doesn't support state/scope
        const response = await fetch(`${RouteBases.api}${Routes.oauth2TokenExchange()}`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: OAUTH_CLIENT_ID,
                client_secret: OAUTH_CLIENT_SECRET,
                grant_type: "authorization_code",
                redirect_uri: SSO_RETURN_URI,
                code: oauth2Code,
                state: state,
                scope: AuthorizationScopes
            })
        })

        const result = AccessToken.parse(await response.json())
        return {
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            expiresIn: result.expires_in
        }
    }

    export async function reauthorizeUser(refreshToken: string): Promise<Authorization> {
        const response = await fetch(`${RouteBases.api}/${Routes.oauth2TokenExchange()}`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: OAUTH_CLIENT_ID,
                client_secret: OAUTH_CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: refreshToken
            })
        })
        const result = RefreshToken.parse(await response.json())
        return {
            accessToken: result.access_token,
            refreshToken: result.refresh_token || refreshToken,
            expiresIn: result.expires_in
        }
    }

    export async function redirect(url: string | URL): Promise<string> {
        const cache = Cache.get()
        const state = await newStateIdKey(cache)
        await cache.set(Cache.Key.oauth2Request(state), maybeUrlToString(url), "EX", 10 * 60) // 10 minutes

        const params = new URLSearchParams()
        params.append("client_id", OAUTH_CLIENT_ID)
        params.append("redirect_uri", SSO_RETURN_URI)
        params.append("response_type", "code")
        params.append("scope", [
            OAuth2Scopes.Identify,
            OAuth2Scopes.Guilds,
            OAuth2Scopes.GuildsMembersRead,
        ].join(" "))
        params.append("state", state)
        return `${OAuth2Routes.authorizationURL}?${params}`
    }
}
