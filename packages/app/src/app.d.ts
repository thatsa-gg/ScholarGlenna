/// <reference types="@sveltejs/kit" />
/// <reference types="@glenna/common" />

type UserProfile = import('@glenna/util').JsonSafe<import('@glenna/common').UserProfile> & {
    displayName: string
}

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
    interface Locals {
        user?: UserProfile
    }
    // interface Platform {}
    interface Session {
        user: false | UserProfile
    }
    // interface Stuff {}
}

// hack to get FontAwesome playing nicely
declare module '@fortawesome/free-brands-svg-icons/index.es' {
    export * from '@fortawesome/free-brands-svg-icons'
}
