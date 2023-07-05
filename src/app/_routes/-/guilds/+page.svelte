<script lang="ts">
    import type { PageServerData } from "./$types"
    export let data: PageServerData;
</script>

<ul>
    {#each data.guilds as guild}
        <li><a href={`/${guild.alias}`}>{guild.name}</a></li>
    {/each}
</ul>
