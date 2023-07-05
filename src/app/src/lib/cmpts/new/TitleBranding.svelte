<script lang="ts">
    import { popstate, internal } from '$lib/client/InternalLink'
    export let href: string
</script>

<svelte:window on:popstate={popstate} />
<a use:internal { href }>thatsa/gg</a>

<style lang="scss">
    a {
        display: block;
        z-index: var(--level-title);
        background: var(--secondary-background);
        color: var(--text);
        box-shadow: var(--shadow-border);
        clip-path: inset(0 0 -6px 0);
    }
</style>
