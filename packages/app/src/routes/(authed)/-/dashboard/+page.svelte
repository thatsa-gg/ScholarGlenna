<script lang="ts">
    import { Guild } from 'discord.js';
    import type { PageServerData } from './$types'
    export let data: PageServerData
</script>

<img alt="{data.user.displayName} avatar" src="https://cdn.discordapp.com/{data.user.avatar}.png">
<h1>{data.user.displayName}</h1>
<h2>Your guilds:</h2>
<ul>
    {#each data.guilds as guild}
        <li><a href="/guild/{guild.alias}">{guild.name}</a></li>
    {:else}
        <li>No guilds!</li>
    {/each}
</ul>
<h2>Your teams:</h2>
<ul>
    {#each data.teams as team}
        <li><a href="/team/{team.guild_alias}{team.team_alias}">{team.name}</a></li>
    {:else}
        <li>No teams!</li>
    {/each}
</ul>
<a title="Sign out" href="/api/logout">Sign Out</a>
