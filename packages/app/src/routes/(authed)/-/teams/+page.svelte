<script lang="ts">
    import MainPanel from '$lib/components/MainPanel.svelte'
    import Sidebar from '$lib/components/Sidebar.svelte'
    import type { PageServerData } from './$types'
    export let data: PageServerData
</script>

<Sidebar>
    <!-- TODO: sidebar title -->
    <!-- TODO: backlink to dashboard -->
    <!-- TODO: team links per guild -->
    <!--
        Maybe instead have sections for:
            - "My Teams"
            - "Public Teams"
            - "Recruiting Teams"
        ?
    -->
</Sidebar>

<MainPanel title="Teams">
    <h2>Your teams:</h2>
    <ul>
        {#each data.teams as team}
            <li><a href="{team.url}">{team.name}</a></li>
        {:else}
            <li>No teams!</li>
        {/each}
    </ul>
</MainPanel>
