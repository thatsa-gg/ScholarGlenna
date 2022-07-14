<script lang="ts">
    export let user: LocalProfile
    export let guild: any
    export let teams: any
</script>

<p>logged in: {user.displayName}</p>

<h1>{guild.name}</h1>

<ul>
    {#each teams as team}
        <li><a href="/teams/{team.alias}">team.name</a></li>
    {/each}
</ul>
