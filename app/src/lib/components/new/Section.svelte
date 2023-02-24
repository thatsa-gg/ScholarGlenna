<script lang="ts">
    import { target } from '$lib/client/InternalLink'
    export let name: string
</script>
<section { name } use:target>
    <slot />
</section>

<style lang="scss">
    section {
        min-height: 100vh;
        max-width: 600px;
        scroll-snap-align: start;
    }
    section.active {
        border-left: 2em solid orange;
    }
</style>
