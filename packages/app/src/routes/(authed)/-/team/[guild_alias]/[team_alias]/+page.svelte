<script lang="ts">
    import type { PageServerData } from './$types'
    export let data: PageServerData
</script>
<style>
    ul img { display: inline-block }
</style>

<p>logged in: {data.user.displayName}</p>

<h1>{data.team.name}</h1>

{#if data.members.length > 0}
    <ul>
        {#each data.members as member}
            <li><img src="{member.avatar}?size=32" alt="{member.name}'s Discord avatar." /> {member.displayName}</li>
        {/each}
    </ul>
{:else}
    <p>This team has no members!</p>
{/if}
