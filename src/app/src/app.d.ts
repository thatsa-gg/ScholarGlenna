/// <reference types="@sveltejs/kit" />

import type { load } from './routes/@[user]/+layout.server'
import type { UserSessionData } from '$lib/server/user'

declare global {
    declare namespace App {
        interface PageData {
            title?: string
            context?: {
                name: string,
                href: string
            }[]
            params?: Params.User
        }

        interface Locals {
            session?: UserSessionData | null
        }

        namespace Params {
            interface User {
                name: string
                alias: string
            }
        }
    }

    declare namespace svelteHTML {
        interface HTMLAttributes<T> {
            'on:clickOutside'?: (event: CustomEvent) => any
        }
    }
}
