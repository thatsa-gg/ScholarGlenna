<script lang="ts">
    import '../app.css';

    import type { LayoutServerData } from './$types';
    import GlobalHeader from '$lib/components/GlobalHeader.svelte';
    import { page } from '$app/stores';
    export let data: LayoutServerData;
</script>

<svelte:head>
    <title>{"Scholar Glenna"}</title>
</svelte:head>

<header class="bg-primary-950 border-b border-primary-750">
    <GlobalHeader user={data.user} />
    {#if $page.data?._components?.localHeader}
        <svelte:component this={$page.data._components.localHeader[0]} {...$page.data._components.localHeader[1]} />
    {/if}
</header>

<main>
    <slot />
</main>

<style lang="postcss">
    :global(body) {
        @apply bg-primary-900;
    }
</style>
