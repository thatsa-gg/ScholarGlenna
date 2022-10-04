<script lang="ts">
    import type { PageServerData } from './$types'
    export let data: PageServerData
</script>

<h2>Your guilds:</h2>
<ul>
    {#each data.guilds as guild}
        <li><a href="{guild.url}">{guild.name}</a></li>
    {:else}
        <li>No guilds!</li>
    {/each}
</ul>
<h2>Your teams:</h2>
<ul>
    {#each data.teams as team}
        <li><a href="{team.url}">{team.name}</a></li>
    {:else}
        <li>No teams!</li>
    {/each}
</ul>
