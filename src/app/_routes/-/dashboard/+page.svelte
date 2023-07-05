<script lang="ts">
    import type { PageServerData } from "./$types"
    export let data: PageServerData;
</script>
<svelte:head><title>Dashboard - Scholar Glenna</title></svelte:head>

<h1>Banner</h1>
<p>Breadcrumbs</p>
<div>
    Select a guild to begin:
    <ul>
        {#each data.guilds as guild}
            <li><a href="/{guild.alias}">{guild.name}</a></li>
        {/each}
    </ul>
</div>
