/// <reference types="@sveltejs/kit" />
/// <reference types="@glenna/common" />

type LocalProfile = import('@glenna/common').LocalProfile

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
    interface Locals {
        user?: LocalProfile
    }
    // interface Platform {}
    interface Session {
        user: false | LocalProfile
    }
    // interface Stuff {}
}

// hack to get FontAwesome playing nicely
declare module '@fortawesome/free-brands-svg-icons/index.es' {
    export * from '@fortawesome/free-brands-svg-icons'
}
