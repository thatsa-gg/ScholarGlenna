<script lang="ts">
    import type { LayoutServerData } from "./$types";
    export let data: LayoutServerData

    import A from "$lib/components/PageNavButton.svelte";
</script>

<svelte:head>
    <title>{data.guild.name} - Scholar Glenna</title>
</svelte:head>

<div>
    {JSON.stringify(data.guild.statistics, null, 2)}
    <!-- region sigils in top right corner: (NA) (EU) -->
    <!-- N teams / M divisions / K unique raiders | X groups / Y members -->
    <!-- Description (collapsed if over certain length, with "more" button) -->
</div>

<nav>
    <A href={`/${data.guild.alias}/-/teams`}>Teams</A>
    <A href={`/${data.guild.alias}/-/leaderboards`}>Leaderboards</A>
    <A href={`/${data.guild.alias}/-/members`}>Members</A>
    <A href={`/${data.guild.alias}/-/logs`}>Logs</A>
    {#if data.permissions.manager}
        <A href={`/${data.guild.alias}/-/applications`}>Applications</A>
        <A href={`/${data.guild.alias}/-/history`}>History</A>
    {/if}
    {#if data.permissions.update}
        <A href={`/${data.guild.alias}/-/settings`}>Settings</A>
    {/if}
</nav>

<slot />

<style lang="postcss">
    div {
        grid-area: info;
    }
    nav {
        grid-area: nav;
    }

    div, nav {
        @apply bg-primary-600 shadow-md w-md;
        @apply transition-width ease-linear;
    }
</style>
