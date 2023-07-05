<script lang="ts">
    import LoginButton from '$lib/components/DiscordLogin.svelte'
    import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
    import Fa from 'svelte-fa';
</script>

<svelte:head>
    <title>Scholar Glenna</title>
</svelte:head>

<main>
    <h1>TODO title</h1>
    <p><span class="font-bold">thatsa.gg</span> is your one-stop tool for Guild Wars 2 static group organization and Discord integration.</p>
    <!-- TODO marketing blurb and features -->
    <div class="login-box">
        <LoginButton />
    </div>

    <a href="/-/guilds" class="underline text-primary-100 hover:text-primary-50">I'm just looking, show me the guilds <Fa icon={faArrowRight} class="inline-block" /></a>
</main>

<style lang="postcss">
    h1 {
        @apply text-3xl
            font-bold
            underline
            sm:italic;
    }

    main {
        grid-area: content;
        /* @apply mt-12 p-6 bg-primary-600 rounded-md shadow-md w-md justify-self-center h-min;
        @apply md:w-sm; */
        @apply sm:w-full;
        @apply transition-width ease-linear;
    }
</style>
