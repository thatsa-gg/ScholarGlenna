/// <reference types="@sveltejs/kit" />
/// <reference types="@glenna/common" />

type UserProfile = import('$lib/UserData').UserProfile
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
