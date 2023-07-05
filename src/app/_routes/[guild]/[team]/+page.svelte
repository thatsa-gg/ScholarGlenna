<script lang="ts">
    import type { PageServerData } from './$types'
    export let data: PageServerData;
    console.log(data)
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>
