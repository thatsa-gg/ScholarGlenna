/// <reference types="@sveltejs/kit" />

import type { load } from './routes/@[user]/+layout.server'
declare namespace App {
    interface PageData {
        title?: string
        context?: {
            name: string,
            href: string
        }[]
        params?:
            Awaited<ReturnType<typeof load>>['params']
    }
}

declare namespace svelteHTML {
    interface HTMLAttributes<T> {
        'on:clickOutside'?: (event: CustomEvent) => any
    }
}
