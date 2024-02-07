// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { Redis as IORedisClient } from "ioredis"
import type { DatabaseConnection as SlonikDatabaseConnection } from "slonik"

declare global {
    type DatabaseConnection = SlonikDatabaseConnection
    type Redis = IORedisClient
    type Nullable<T> = null | T
    type Optional<T> = undefined | T
    declare namespace Glenna {
        interface Session {
            id: string
            profileId: number
            userId: number
            accessToken: string
        }

        interface SessionUser {
            user: Id.User & {
                name: string
                discordId: bigint
                avatar: Nullable<string>
            }
        }

        interface User {
            name: string
            url: {
                user: string
                avatar: string
                logs: string
            }
        }

        interface ClientSessionUser extends User {
            guilds: UserGuild[]
        }

        interface UserGuild {
            name: string
            teams: UserTeam[]
        }

        interface UserTeam {
            name: string
            icon: string
        }

        interface UserSessionData {
            profile : { id: number }
            user: {
                id: number
                discordId: bigint
                name: string
                avatar: string | null
            }
        }

        namespace Id {
            interface User { userId: number }
            interface Guild { guildId: number }
            interface Profile { profileId: number }
            interface Team { teamId: number }
        }

        interface Context {
            name: string
            href?: string
        }

        interface Guild extends Id.Guild {
            name: string
            slug: string
            isMember?: boolean
            description: null | string
            serverRegion: null | "na" | "eu" | "na-eu"
            count: {
                teams: number
                leagues: number
                members: number
            }
            url: {
                guild: string
                icon: null | { url: string, static: string }
                invite: null | string
                teams: string
                logs: string
                apply: string | null
                applications: string | null
                settings: string
            }
            permission: {
                update: boolean
            }
        }
    }

	namespace App {
		// interface Error {}
		interface Locals {
            connection: DatabaseConnection
            cache: Redis
            session: Glenna.SessionUser | null
        }
		interface PageData {
            sessionUser: Nullable<Glenna.ClientSessionUser>
            context: [Glenna.Context, ...Glenna.Context[]]
        }
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
