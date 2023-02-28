<script lang="ts">
    import LoginButton from '$lib/components/LoginButton.svelte'
</script>

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.gray.100);
        @apply dark:bg-slate-700 dark:text-white;
    }
    main {
        @apply mx-auto px-6 bg-slate-900 h-full drop-shadow-lg;
        @apply w-md md:w-sm sm:w-full transition-width ease-linear;
    }
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

<main>
    <h1>TODO title</h1>
    <p><span>thatsa.gg</span> is your one-stop tool for Guild Wars 2 static group organization and Discord integration.</p>
    <!-- TODO marketing blurb and features -->
    <div class="login-box">
        <LoginButton />
    </div>
</main>
