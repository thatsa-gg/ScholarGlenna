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
        grid-template:
            "branding header tools user" 3rem
            "nav content content content" auto / 20rem auto min-content fit-content(20rem);
        @apply bg-primary-500;
    }
</style>

<h1 class="bg-primary-400 [grid-area:branding] shadow-sm">thatsa.gg<!-- TODO: real logo --></h1>

{#if data.user}
<nav class="bg-primary-400 [grid-row:header] [grid-column:header-start/tools-end] shadow-sm">
    search
    <!-- TODO: search -->
</nav>
<div class="bg-primary-400 [grid-area:user] shadow-sm content-center p-1 flex justify-end">
    <UserMenu user={data.user} />
</div>

{:else}
<div class="bg-primary-400 [grid-row:header] [grid-column:header-start/user-end] shadow-sm flex justify-end">
    <LoginButton />
</div>
{/if}

<slot/>
