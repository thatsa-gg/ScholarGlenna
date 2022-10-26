<script lang="ts">
    import MainPanel from '$lib/components/MainPanel.svelte'
    import Sidebar from '$lib/components/Sidebar.svelte'
    import SidebarHeader from '$lib/components/SidebarHeader.svelte';
    import type { PageServerData } from './$types'
    export let data: PageServerData
</script>

<svelte:head>
    <title>Dashboard</title>
</svelte:head>

<Sidebar>
    <SidebarHeader>
        hello
    </SidebarHeader>
</Sidebar>

<MainPanel title="Dashboard">
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
</MainPanel>
