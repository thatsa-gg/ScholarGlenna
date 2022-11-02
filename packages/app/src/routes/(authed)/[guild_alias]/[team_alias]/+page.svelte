<script lang="ts">
    import MainPanel from '$lib/components/MainPanel.svelte'
    import Sidebar from '$lib/components/Sidebar.svelte'
    import TeamInfo from '$lib/components/sidebar/TeamInfo.svelte'
    import NavBack from '$lib/components/sidebar/NavBack.svelte'
    import NavItem from '$lib/components/sidebar/NavItem.svelte'
    import SidebarHeader from '$lib/components/SidebarHeader.svelte'
    import type { PageServerData } from './$types'

    import { faGear, faBook, faArrowRight, faTrophy } from '@fortawesome/free-solid-svg-icons'

    export let data: PageServerData
</script>

<svelte:head>
    <title>{data.team.name}</title>
</svelte:head>

<Sidebar>
    <SidebarHeader>
        <TeamInfo {...data.team} />
        <NavBack {...data.guild} />
        <NavItem href={data.team.settingsUrl} icon={faGear} color="var(--icon-gray)">Settings</NavItem>
    </SidebarHeader>
    <NavItem href={data.team.recordsUrl} icon={faTrophy} tag={faArrowRight}>Records</NavItem>
    <NavItem href={data.team.logsUrl} icon={faBook} tag={faArrowRight}>Logs</NavItem>
</Sidebar>

<MainPanel title={data.team.name}>
    {#if data.members.length > 0}
        <ol>
            {#each data.members as member}
                <li>
                    <img
                        src="{member.avatar}?size=32"
                        alt="{member.name}'s Discord avatar."
                    />
                    {member.displayName}
                </li>
            {/each}
        </ol>
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
