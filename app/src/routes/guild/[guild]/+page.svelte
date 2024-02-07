<script lang="ts">
    import type { PageData } from "./$types"

    // Components
    import App from "$components/App.svelte"
    import Card from "$components/Card.svelte"
    import CenterColumn from "$components/CenterColumn.svelte"
    import GuildInfoCard from "$components/GuildInfoCard.svelte"
    import GuildHeader from "$components/GuildHeader.svelte"
    import TeamTable from "$components/TeamTable.svelte"

    // Icons

    // Properties
    export let data: PageData
</script>

<svelte:head>
    <title>{data.guild.name} | Scholar Glenna</title>
</svelte:head>

<App>
    <GuildHeader guild={data.guild} slot="header" />
    <CenterColumn>
        <GuildInfoCard guild={data.guild} style="hero" />
        {#if data.guild.permission.update}
            <Card>
                button group/info card for managers
            </Card>
        {/if}
        <TeamTable teams={data.teams} />
    </CenterColumn>
</App>
