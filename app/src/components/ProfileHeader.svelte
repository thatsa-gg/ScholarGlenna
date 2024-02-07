<script lang="ts">
    import { page } from "$app/stores"
    import { ClientAppUrl } from "$lib/url"

    // Components
    import LocalHeader from "./LocalHeader.svelte"
    import HeaderButton from "./HeaderButton.svelte"

    // Icons
    import IconUser from "@iconify-icons/octicon/person-16"
    import IconGear from "@iconify-icons/octicon/gear-16"
    import IconLogs from "@iconify-icons/octicon/log-16"

    // Properties
    export let user: Glenna.User = $page.data.sessionUser!
    $: isSelf = user.name === $page.data.sessionUser?.name
</script>

<LocalHeader>
    <HeaderButton href={user.url.user} icon={IconUser}>Profile</HeaderButton>
    <HeaderButton href="/todo">Teams</HeaderButton>
    <HeaderButton href={user.url.logs} icon={IconLogs}>Logs</HeaderButton>
    {#if isSelf}
        <HeaderButton href={ClientAppUrl.Settings} icon={IconGear}>Settings</HeaderButton>
    {/if}
</LocalHeader>
