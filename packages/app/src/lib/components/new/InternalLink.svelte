<script lang="ts">
    import { popstate, internal } from '$lib/client/InternalLink'
    export let href: string
</script>

<svelte:window on:popstate={popstate} />
<a use:internal { href } { ...$$restProps }><slot /></a>
