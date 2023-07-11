<script lang="ts">
    import type { PageData } from "./$types"
    export let data: PageData
</script>

<h1>{data.guild.name}</h1>
<hr />
<ul class="list-disc">
    {#each data.guild.teams as team}
        <li><a href={`/${data.guild.alias}/${team.alias}`}>{team.name}</a></li>
    {/each}
</ul>
<hr />
<pre>{JSON.stringify(data, null, 2)}</pre>
