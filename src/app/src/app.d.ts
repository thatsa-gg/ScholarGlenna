/// <reference types="@sveltejs/kit" />

declare namespace App {
    interface PageData {
        title?: string
        context?: {
            name: string,
            href: string
        }[]
    }
}

declare namespace svelteHTML {
    interface HTMLAttributes<T> {
        'on:clickOutside'?: (event: CustomEvent) => any
    }
}
