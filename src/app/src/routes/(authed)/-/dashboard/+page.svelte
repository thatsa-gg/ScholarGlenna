<script lang="ts">
    import type { PageServerData } from "./$types"
    export let data: PageServerData;
</script>
<svelte:head><title>Dashboard - Scholar Glenna</title></svelte:head>

<h1>Banner</h1>
<p>Breadcrumbs</p>
<div>
    <p>Content</p>
    <pre>{JSON.stringify(data.guilds, null, 4)}</pre>
</div>
