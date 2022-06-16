/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
type User = import('./lib/user').User
declare namespace App {
    interface Locals {
        user?: User
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
