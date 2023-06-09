<script lang="ts">
    import type { PageServerData } from "./$types";
    export let data: PageServerData;
</script>
<!-- TODO: division selector -->
{#if data.permissions.createTeam}
    <!-- TODO: box for team creation -->
{/if}
<pre>{JSON.stringify(data.teams, null, 2)}</pre>

<style lang="postcss">
    pre {
        grid-area: content;
    }
</style>
