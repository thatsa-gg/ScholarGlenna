<script lang="ts">
    import '../app.css'

    import type { LayoutServerData } from './$types'
    import Branding from '$lib/components/header/Branding.svelte'
    import LoggedInHeader from '$lib/components/header/LoggedInHeader.svelte'
    import LoggedOutHeader from '$lib/components/header/LoggedOutHeader.svelte'
    export let data: LayoutServerData;
</script>

<Branding />
{#if data.user}
    <LoggedInHeader user={data.user} />
{:else}
    <LoggedOutHeader />
{/if}

<slot/>

<style lang="postcss">
    :global(body) {
        display: grid;
        /* TODO: figure out a proper width for tools so when it's missing user doesn't get shifted */
        grid-template:
            "branding header  tools   user" 3rem
            "content  content content content" auto
            / 20rem auto 1fr min-content;
        @apply bg-primary-500;
    }
</style>
