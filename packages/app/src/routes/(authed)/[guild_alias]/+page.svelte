<script lang="ts">
    import type { PageServerData } from './$types'
    import Sidebar from '$lib/components/Sidebar.svelte'
    import MainPanel from '$lib/components/MainPanel.svelte'
    import SidebarHeader from '$lib/components/SidebarHeader.svelte'
    import NavTeam from '$lib/components/sidebar/nav/NavTeam.svelte'
    export let data: PageServerData
</script>
<!--
<Nav title={data.guild.name}>
    <Nav.Item icon={false} action={'drill'}>Teams</Nav.Item>
</Nav>
-->
<Sidebar>
    <SidebarHeader>
        {data.guild.name}
    </SidebarHeader>
    {#each data.guild.teams.filter(team => team.onTeam) as team}
        <NavTeam team={team} />
    {/each}
    <hr /><!-- TODO: accordion -->
    {#each data.guild.teams.filter(team => !team.onTeam) as team}
        <NavTeam team={team} />
    {/each}
</Sidebar>
<MainPanel title={data.guild.name} banner={data.guild.splash}>
    <ul>
        {#each data.guild.teams as team}
            <li><a href="{team.url}">{team.name}</a></li>
        {/each}
        <li><a href="{data.guild.newTeamUrl}"><i>create new team</i></a></li>
    </ul>
</MainPanel>
