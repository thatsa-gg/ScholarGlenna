<script lang="ts">
    // Components
    import App from "$components/App.svelte"
    import DiscordLoginButtonLink from "$components/DiscordLoginButtonLink.svelte"
    import Icon from "$components/Icon.svelte"

    // Icons
    import IconArrowRight from "@iconify-icons/majesticons/arrow-right"
</script>

<svelte:head>
    <title>Scholar Glenna</title>
</svelte:head>

<App>
    <main>
        <h1>TODO title</h1>
        <p><span class="font-bold">thatsa.gg</span> is your one-stop tool for Guild Wars 2 static group organization and Discord integration.</p>
        <!-- TODO marketing blurb and features -->
        <div class="login-box">
            <DiscordLoginButtonLink />
        </div>

        <a href="/-/guilds" class="underline text-primary-100 hover:text-primary-50">
            I'm just looking, show me the guilds <Icon icon={IconArrowRight} class="inline-block" />
        </a>
    </main>
</App>
