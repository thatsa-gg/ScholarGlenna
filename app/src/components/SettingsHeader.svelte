<script lang="ts">
    import { ClientAppUrl } from "$lib/url"

    // Components
    import LocalHeader from "./LocalHeader.svelte"
    import HeaderButton from "./HeaderButton.svelte"

    // Icons
    import IconGear from "@iconify-icons/octicon/gear-16"
    import IconTools from "@iconify-icons/octicon/tools-16"
    import IconKey from "@iconify-icons/octicon/key-16"
</script>

<LocalHeader>
    <HeaderButton href={ClientAppUrl.Settings} icon={IconGear}>Settings</HeaderButton>
    <HeaderButton href={ClientAppUrl.SettingsBuilds} icon={IconTools}>Builds</HeaderButton>
    <HeaderButton href={ClientAppUrl.SettingsAccounts} icon={IconKey}>Accounts</HeaderButton>
</LocalHeader>
