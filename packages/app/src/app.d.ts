/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
	interface Locals {
        access_token?: string
    }
	// interface Platform {}
	interface Session {
        user: false | Record<string, string>
    }
	// interface Stuff {}
}
