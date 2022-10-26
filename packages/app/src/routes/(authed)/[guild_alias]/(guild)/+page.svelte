<script lang="ts">
    import type { PageServerData } from './$types'
    import Sidebar from '$lib/components/Sidebar.svelte'
    import MainPanel from '$lib/components/MainPanel.svelte'
    import SidebarHeader from '$lib/components/SidebarHeader.svelte'
    import SidebarAccordion from '$lib/components/sidebar/SidebarAccordion.svelte'
    import NavTeam from '$lib/components/sidebar/NavTeam.svelte'
    import NavItem from '$lib/components/sidebar/NavItem.svelte'
    import NavHeader from '$lib/components/sidebar/NavHeader.svelte'
    import NavBanner from '$lib/components/sidebar/NavBanner.svelte'
    import ScrollArea from '$lib/components/ScrollArea.svelte'

    import { faGear, faUsers, faCirclePlus } from '@fortawesome/free-solid-svg-icons'

    export let data: PageServerData
    const ownTeams = data.guild.teams.filter(team => team.onTeam)
</script>

<svelte:head>
    <title>{data.guild.name}</title>
</svelte:head>

<Sidebar>
    <SidebarHeader>
        {#if data.guild.splash}
            <NavBanner banner={data.guild.splash} alt={data.guild.name} {...data.guild.splashProps}/>
        {:else}
            <NavHeader banner={data.guild.splash}>{data.guild.name}</NavHeader>
        {/if}
        <NavItem href={data.guild.settingsUrl} icon={faGear} color="var(--icon-gray)">Settings</NavItem>
        <NavItem href={data.guild.membersUrl} icon={faUsers}>Members</NavItem>
        <NavItem href={data.guild.newTeamUrl} icon={faCirclePlus} color="var(--icon-green)">Create a Team</NavItem>
    </SidebarHeader>
    <ScrollArea>
        <section aria-label="Your teams.">
            {#each ownTeams as team}
                <NavTeam {...team} />
            {/each}
        </section>
        <SidebarAccordion aria-label="Other teams." fixed={0 === ownTeams.length}>
            {#each data.guild.teams.filter(team => !team.onTeam) as team}
                <NavTeam {...team} />
            {/each}
        </SidebarAccordion>
    </ScrollArea>
</Sidebar>
<MainPanel title={data.guild.name}>
    <ul>
        {#each data.guild.teams as team}
            <li><a href="{team.url}">{team.name}</a></li>
        {/each}
    </ul>
</MainPanel>
