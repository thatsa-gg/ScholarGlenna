<script lang="ts">
    import '../app.css'

    import type { LayoutServerData } from './$types'
    export let data: LayoutServerData

    import LoginButton from '$lib/components/LoginButton.svelte'
</script>

<style lang="postcss">
    :global(body) {
        display: grid;
        grid-template:
            "branding header tools user" 3rem
            "nav content content content" auto / 20rem auto min-content fit-content(20rem);
        @apply bg-primary-500;
    }

    h1, nav {
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

    .user-info {
        grid-area: user;
        @apply bg-primary-500;

        &.signed-out {
            @apply bg-primary-400;
        }
    }
</style>

<h1>thatsa.gg<!-- TODO: real logo --></h1>

{#if data.user}
<nav>
    search
    <!-- TODO: search -->
</nav>
<div>user info</div>
<!-- TODO: user branding or login -->

{:else}
<div class="bg-primary-400 [grid-row:header] [grid-column:header-start/user-end] shadow-sm flex justify-end">
    <LoginButton />
</div>
{/if}

<slot/>
