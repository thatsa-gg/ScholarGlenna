<script lang="ts">
    import type { _Guild } from './index'
    export let user: UserProfile
    export let guild: _Guild
</script>

<p>logged in: {user.displayName}</p>

<h1>{guild.name}</h1>

<ul>
    {#each guild.teams as team}
        <li><a href="/t/{team.alias}">team.name</a></li>
    {/each}
    <li><a href="/g/{guild.alias}/new-team"><i>create new team</i></a></li>
</ul>
