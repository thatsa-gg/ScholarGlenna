<script lang="ts">
    import LoginButton from '$lib/components/LoginButton.svelte'
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
        @apply mt-12 p-6 bg-primary-400 rounded-md shadow-md w-md justify-self-center h-min;
        @apply md:w-sm;
        @apply sm:w-full;
        @apply transition-width ease-linear;
    }
</style>
