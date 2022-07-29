<script lang="ts">
    import type { _Guild } from './index'
    export let user: UserProfile
    export let guild: _Guild
</script>

<p>logged in: {user.displayName}</p>

<h1>{guild.name}</h1>

<pre>
{JSON.stringify(guild)}
</pre>

<ul>
    {#each guild.teams as team}
        <li><a href="/teams/{team.alias}">team.name</a></li>
    {/each}
</ul>
