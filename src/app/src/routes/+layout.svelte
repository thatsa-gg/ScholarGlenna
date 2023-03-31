<script lang="ts">
    import '../app.css'

    import type { LayoutServerData } from './$types'
    export let data: LayoutServerData
</script>

<style lang="postcss">
    :global(body) {
        display: grid;
        grid-template:
            "branding header user" 3rem
            "nav content content" auto / 20rem auto 10rem;
        @apply bg-primary-500;
    }

    h1, nav, div {
        @apply shadow-sm;
    }

    h1 {
        grid-area: branding;
        @apply bg-primary-400;
    }

    nav {
        grid-area: header;
        @apply bg-primary-500;

        &.signed-out {
            @apply bg-primary-400;
        }
    }

    div {
        grid-area: user;
        @apply bg-primary-500;

        &.signed-out {
            @apply bg-primary-400;
        }
    }
</style>

<h1>thatsa.gg<!-- TODO: real logo --></h1>
<nav class:signed-out={!data.user}>
    search
    <!-- TODO: search -->
</nav>
<div class:signed-out={!data.user}>user</div>
<!-- TODO: user branding or login -->

<slot/>
