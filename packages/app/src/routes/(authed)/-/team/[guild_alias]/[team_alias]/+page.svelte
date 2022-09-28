<script lang="ts">
    import type { PageServerData } from './$types'
    export let data: PageServerData
</script>

<p>logged in: {data.user.displayName}</p>

<h1>{data.team.name}</h1>
