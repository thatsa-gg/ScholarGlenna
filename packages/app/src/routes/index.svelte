<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'
    export const load: Load = ({session}) => ({
        props: {
            user: session.user || false
        }
    })
</script>
<script lang="ts">
    export let user: false | Record<string, string>
    console.log(user)
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#if user}
<a href="/api/login">login</a>
{:else}
<a href="/api/logout">logout</a>
{/if}
{JSON.stringify(user)}
<!--
{#if !user}
    <a href="/api/login">login</a>
{:else}
    Excelsior! Welcome, {user.username}!<br/>
    <img src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png?size=64" alt="You!" />
{/if}
-->
