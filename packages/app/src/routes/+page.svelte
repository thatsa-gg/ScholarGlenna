<script lang="ts">
    import type { PageServerData } from './$types'
    import LoginButton from '$lib/components/LoginButton.svelte'
    export let data: PageServerData
</script>
{#if !data.user}
    <main>
        <h1>TODO title</h1>
        <p><span>thatsa.gg</span> is your one-stop tool for Guild Wars 2 static group organization and Discord integration.</p>
        <!-- TODO marketing blurb and features -->
    </main>
    <div class="login-box">
        <LoginButton />
    </div>
{:else}
    <img alt="{data.user.displayName} avatar" src="https://cdn.discordapp.com/{data.user.avatar}.png">
    <h1>{data.user.displayName}</h1>
    <h2>Your guilds:</h2>
    <ul>
        {#each data.guilds as guild}
            <li><a href="/g/{guild.alias}">{guild.name}</a></li>
        {:else}
            <li>No guilds!</li>
        {/each}
    </ul>
    <h2>Your teams:</h2>
    <ul>
        {#each data.teams as team}
            <li><a href="/t/{team.alias}">{team.name}</a></li>
        {:else}
            <li>No teams!</li>
        {/each}
    </ul>
    <a title="Sign out" href="/api/logout">Sign Out</a>
{/if}
