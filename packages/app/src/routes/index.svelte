<script lang="ts" context="module">
    import { session } from '$app/stores'
</script>
<script lang="ts">
    let user = $session.user
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#if !user}
    <a title="Discord OAuth2" href="/api/login">Authenticate via Discord</a>
{:else}
    <img alt="{user.username}#{user.discriminator} avatar" src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png">
    <h1>{user.username}#{user.discriminator}</h1>
    <a title="Sign out" href="/api/logout">Sign Out</a>
{/if}
