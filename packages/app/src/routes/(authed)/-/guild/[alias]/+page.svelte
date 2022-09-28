<script lang="ts">
    import type { PageServerData } from './$types'
    export let data: PageServerData
</script>

<p>logged in: {data.user.displayName}</p>

<h1>{data.guild.name}</h1>

<ul>
    {#each data.guild.teams as team}
        <li><a href="{team.url}">{team.name}</a></li>
    {/each}
    <li><a href="{data.guild.newTeamUrl}"><i>create new team</i></a></li>
</ul>
