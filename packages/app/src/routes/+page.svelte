<script lang="ts">
    import type { _Guild, _Team } from './index'
    import LoginButton from '$lib/components/LoginButton.svelte'
    import { session } from '$app/stores'
    export let guilds: _Guild[]
    export let teams: _Team[]
</script>
{#if !$session.user}
    <main>
        <h1>TODO title</h1>
        <p><span>thatsa.gg</span> is your one-stop tool for Guild Wars 2 static group organization and Discord integration.</p>
        <!-- TODO marketing blurb and features -->
    </main>
    <div class="login-box">
        <LoginButton />
    </div>
{:else}
    <img alt="{$session.user.displayName} avatar" src="https://cdn.discordapp.com/avatars/{$session.user.snowflake}/{$session.user.avatar}.png">
    <h1>{$session.user.displayName}</h1>
    <h2>Your guilds:</h2>
    <ul>
        {#each guilds as guild}
            <li><a href="/g/{guild.alias}">{guild.name}</a></li>
        {:else}
            <li>No guilds!</li>
        {/each}
    </ul>
    <h2>Your teams:</h2>
    <ul>
        {#each teams as team}
            <li><a href="/t/{team.alias}">{team.name}</a></li>
        {:else}
            <li>No teams!</li>
        {/each}
    </ul>
    <a title="Sign out" href="/api/logout">Sign Out</a>
{/if}
