import { building } from "$app/environment"
import { env } from "$env/dynamic/private"

const die = building || true ? (message: string) => message : (message: string) => {
    throw message
}

export const ORIGIN = env.ORIGN ?? "http://localhost:8080"
export const SSO_RETURN_URI = `${ORIGIN}/auth/sso/return`

export const DISCORD_TOKEN = env.DISCORD_TOKEN ?? die("Missing DISCORD_TOKEN")
export const OAUTH_CLIENT_ID = env.OAUTH_CLIENT_ID ?? die("Missing OAUTH_CLIENT_ID")
export const OAUTH_CLIENT_SECRET = env.OAUTH_CLIENT_SECRET ?? die("Missing OAUTH_CLIENT_SECRET")

export const DATABASE_URL = env.DATABASE_URL ?? die("Missing DATABASE_URL")
export const REDIS_URI = env.REDIS_URI ?? die("Missing REDIS_URI")
