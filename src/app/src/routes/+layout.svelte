<script lang="ts">
    import '../app.css'

    import type { LayoutServerData } from './$types'
    export let data: LayoutServerData

    import LoginButton from '$lib/components/LoginButton.svelte'
    import UserMenu from '$lib/components/UserMenu.svelte'
</script>

<style lang="postcss">
    :global(body) {
        display: grid;
        /* TODO: figure out a proper width for tools so when it's missing user doesn't get shifted */
        grid-template:
            "branding header tools user" 3rem
            "nav content content content" auto / 20rem auto 1fr min-content;
        @apply bg-primary-500;
    }
</style>

<h1 class="bg-primary-400 [grid-area:branding] shadow-sm">thatsa.gg<!-- TODO: real logo --></h1>

{#if data.user}
<nav class="bg-primary-400 [grid-row:header] [grid-column:header-start/tools-end] shadow-sm">
    search
    <!-- TODO: search -->
</nav>
<div class="bg-primary-400 [grid-area:user] shadow-sm content-center p-1">
    <UserMenu user={data.user} />
</div>

{:else}
<div class="bg-primary-400 [grid-row:header] [grid-column:header-start/user-end] shadow-sm flex justify-end">
    <LoginButton />
</div>
{/if}

<slot/>
