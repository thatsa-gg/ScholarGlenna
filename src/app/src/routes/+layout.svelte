<script lang="ts">
    import '../app.css';

    import type { LayoutServerData } from './$types';
    import GlobalHeader from '$lib/components/GlobalHeader.svelte';
    export let data: LayoutServerData;
</script>

<svelte:head>
    <title>{"Scholar Glenna"}</title>
</svelte:head>

<header class="pb-2 bg-primary-900">
    <GlobalHeader user={data.user} />
    <slot name="local-header" />
</header>

<div class="min-h-[400vh] pt-4">
    <slot />
</div>


<style lang="postcss">
    :global(body) {
        //display: grid;
        /* TODO: figure out a proper width for tools so when it's missing user doesn't get shifted */
        //grid-template:
            //"branding header  tools   user" 3rem
            //"content  content content content" auto
            /// 20rem auto 1fr min-content;
        @apply bg-primary-500;
    }
</style>
