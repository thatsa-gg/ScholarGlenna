<script lang="ts">
    import MainPanel from '$lib/components/MainPanel.svelte'
    import Sidebar from '$lib/components/Sidebar.svelte'
    import NavBack from '$lib/components/sidebar/NavBack.svelte'
    import TeamInfo from '$lib/components/sidebar/TeamInfo.svelte'
    import SidebarHeader from '$lib/components/SidebarHeader.svelte'
    import type { PageServerData } from './$types'

    export let data: PageServerData
</script>

<svelte:head>
    <title>{data.team.name}</title>
</svelte:head>

<Sidebar>
    <SidebarHeader>
        <h1 style="margin:0">{data.team.name}</h1>
        <TeamInfo team={data.team} />
        <NavBack to={data.guild} />
    </SidebarHeader>
</Sidebar>

<MainPanel title={data.team.name}>
    {#if data.members.length > 0}
        <ul>
            {#each data.members as member}
                <li>
                    <img
                        src="{member.avatar}?size=32"
                        alt="{member.name}'s Discord avatar."
                    />
                    {member.displayName}
                </li>
            {/each}
        </ul>
    {:else}
        <p>This team has no members!</p>
    {/if}
</MainPanel>

<style>
    ul img {
        display: inline-block;
    }
    img {
        height: 32px;
    }
</style>
