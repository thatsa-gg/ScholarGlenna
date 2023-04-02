<script lang="ts">
    import LoginButton from '$lib/components/LoginButton.svelte'
    import type { PageServerData } from './$types'
    export let data: PageServerData
</script>

<style lang="postcss">
    h1 {
        @apply text-3xl
            font-bold
            underline
            sm:italic;
    }
</style>

<svelte:head>
    <title>Scholar Glenna</title>
</svelte:head>

{#if !data.user || true}
<main class="[grid-row:content] [grid-column:nav/content] place-self-center p-6 bg-primary-400 rounded-md w-md md:w-sm sm:w-full transition-width ease-linear shadow-md">
    <h1>TODO title</h1>
    <p><span style="font-weight:bold">thatsa.gg</span> is your one-stop tool for Guild Wars 2 static group organization and Discord integration.</p>
    <!-- TODO marketing blurb and features -->
    <div class="login-box">
        <LoginButton />
    </div>
</main>
{:else}
TODO show dashboard
{/if}
