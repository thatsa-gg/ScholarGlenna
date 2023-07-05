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

<header class="pb-2 bg-primary-900">
    <GlobalHeader user={data.user} />
    {#if $page.data?._components?.localHeader}
        <svelte:component this={$page.data._components.localHeader[0]} {...$page.data._components.localHeader[1]} {...data} />
    {/if}
</header>

<div class="min-h-[400vh] pt-4">
    <slot />
</div>

<style lang="postcss">
    :global(body) {
        @apply bg-primary-500;
    }
</style>
