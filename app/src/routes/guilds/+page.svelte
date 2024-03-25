<script lang="ts">
    import type { PageData } from "./$types"
    // Components
    import App from "$components/App.svelte"
    import Card from "$components/Card.svelte"
    import CardSeparator from "$components/CardSeparator.svelte"
    import CenterColumn from "$components/CenterColumn.svelte"
    import DiscordLoginButtonLink from "$components/DiscordLoginButtonLink.svelte"
    import GuildInfoCard from "$components/GuildInfoCard.svelte"

    // Icons

    // Properties
    let { data }: { data: PageData } = $props()
    let user = data.sessionUser
    let ownGuilds = data.guilds.filter(guild => guild.isMember)
    let publicGuilds = data.guilds.filter(guild => !guild.isMember)
</script>

<svelte:head>
    <title>Guilds | Scholar Glenna</title>
</svelte:head>

<App>
    <CenterColumn>
        {#if !user}
            <Card layout="row" class="justify-center">
                <span>You're not signed in.</span>
                <DiscordLoginButtonLink>Sign in to see your guilds.</DiscordLoginButtonLink>
            </Card>
        {:else if ownGuilds.length > 0}
            {#if publicGuilds.length > 0}
                <CardSeparator>Your Guilds</CardSeparator>
            {/if}
            {#each ownGuilds as guild}
                <GuildInfoCard {guild} showGuildPageLink />
            {/each}
        {/if}
        {#if publicGuilds.length > 0}
            <CardSeparator>Public Guilds</CardSeparator>
            {#each publicGuilds as guild}
                <GuildInfoCard {guild} showGuildPageLink />
            {/each}
        {:else if ownGuilds.length === 0}
            <CardSeparator>Public Guilds</CardSeparator>
            <Card layout="row" class="justify-center">
                <span class="text-primary-200 text-sm italic">There are no public guilds.</span>
            </Card>
        {/if}
    </CenterColumn>
</App>

