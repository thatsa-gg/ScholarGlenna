<script lang="ts">
    import { ClientAppUrl } from "$lib/url"

    // Components
    import LocalHeader from "./LocalHeader.svelte"
    import LocalHeaderRow from "./LocalHeaderRow.svelte"
    import HeaderButton from "./HeaderButton.svelte"

    // Icons
    import IconGear from "@iconify-icons/octicon/gear-16"
    import IconTeams from "@iconify-icons/octicon/people-16"
    import IconLogs from "@iconify-icons/octicon/log-16"

    // Properties
    export let guild: Glenna.Guild
</script>

<LocalHeader multirow>
    <LocalHeaderRow>
        <HeaderButton href={guild.url.guild} class="font-bold">{guild.name}</HeaderButton>
        <HeaderButton href={guild.url.teams} icon={IconTeams}>Teams</HeaderButton>
        <HeaderButton href={guild.url.logs} icon={IconLogs}>Logs</HeaderButton>
        {#if guild.url.apply}
            <HeaderButton href={guild.url.apply}>Apply</HeaderButton>
        {/if}
    </LocalHeaderRow>

    <LocalHeaderRow>
        {#if guild.url.applications}
            <HeaderButton href={guild.url.applications}>Applications</HeaderButton>
        {/if}
        <HeaderButton href={guild.url.settings} icon={IconGear}>Settings</HeaderButton>
    </LocalHeaderRow>
</LocalHeader>
