<script lang="ts">
    import '../app.css'
</script>

<h1>thatsa.gg<!-- TODO: real logo --></h1>

<slot/>

<style lang="postcss">
    :global(body) {
        display: grid;
        /* TODO: figure out a proper width for tools so when it's missing user doesn't get shifted */
        grid-template:
            "branding header tools user" 3rem
            "nav content content content" auto / 20rem auto 1fr min-content;
        @apply bg-primary-500;
    }

    h1 {
        grid-area: branding;
        @apply bg-primary-400 shadow-sm;
    }
</style>
