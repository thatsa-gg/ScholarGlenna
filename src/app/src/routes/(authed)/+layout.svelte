<script lang="ts">
    import type { LayoutServerData } from './$types'
    export let data: LayoutServerData

    import UserMenu from '$lib/components/UserMenu.svelte'
</script>
<nav class="bg-primary-400 [grid-row:header] [grid-column:header-start/tools-end] shadow-sm">
    search
    <!-- TODO: search -->
</nav>
<div class="bg-primary-400 [grid-area:user] shadow-sm content-center p-1">
    <UserMenu user={data.user} />
</div>

<slot />
