/// <reference types="@sveltejs/kit" />
/// <reference types="@glenna/common" />

type Profile = import('@glenna/common').Profile

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
    interface Locals {
        user?: Profile | null
    }
    // interface Platform {}
    interface Session {
        user: false | User
    }
    // interface Stuff {}
}

// hack to get FontAwesome playing nicely
declare module '@fortawesome/free-brands-svg-icons/index.es' {
    export * from '@fortawesome/free-brands-svg-icons'
}
