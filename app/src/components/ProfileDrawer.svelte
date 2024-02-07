<script lang="ts">
    import { ClientAppUrl } from "$lib/url"
    import { page } from "$app/stores"

    // Components
    import Drawer from "./Drawer.svelte"
    import UserIcon from "./UserIcon.svelte"
    import Icon from "@iconify/svelte"
    import ScrollPane from "./ScrollPane.svelte"
    import DrawerButton from "./DrawerButton.svelte"
    import DrawerDivider from "./DrawerDivider.svelte"
    import CloseDrawerButton from "./CloseDrawerButton.svelte"

    // Icons
    import IconKey from "@iconify-icons/octicon/key-16"
    import IconLog from "@iconify-icons/octicon/log-16"
    import IconLogOut from "@iconify-icons/octicon/sign-out-16"
    import IconLogOutHover from "@iconify-icons/majesticons/logout-line"
    import IconTools from "@iconify-icons/octicon/tools-16"
    import IconSettingsCog from "@iconify-icons/octicon/gear-16"
    import IconUser from "@iconify-icons/octicon/person-16"

    // Properties
    export let drawer: Drawer = undefined! // bound below
    let user = $page.data.sessionUser
</script>

<Drawer id="profile-drawer" bind:this={drawer} placement="right">
    {#if user}
    <div class="flex justify-between items-center p-4">
        <span class="flex gap-2 items-center">
            <UserIcon {user} size=32 />
            <span class="
                block overflow-hidden
                text-ellipsis whitespace-nowrap
                font-semibold
            ">{user.name}</span>
        </span>
        <CloseDrawerButton {drawer} />
    </div>

    <ScrollPane class="flex-grow">
        <nav>
            <ul class="p-4">
                <DrawerButton href={user.url.user}>
                    <Icon icon={IconUser} class="text-xl" slot="leader" />
                    Your Profile
                </DrawerButton>
                <DrawerButton href={user.url.logs}>
                    <Icon icon={IconLog} class="text-xl" slot="leader" />
                    Your Logs
                </DrawerButton>
                <DrawerDivider />
                <DrawerButton href={ClientAppUrl.Settings} on:click={() => drawer.setState(false)}>
                    <Icon icon={IconSettingsCog} class="text-xl" slot="leader" />
                    Account Settings
                </DrawerButton>
                <DrawerButton href={ClientAppUrl.SettingsBuilds} on:click={() => drawer.setState(false)}>
                    <Icon icon={IconTools} class="text-xl" slot="leader" />
                    Builds
                </DrawerButton>
                <DrawerButton href={ClientAppUrl.SettingsAccounts} on:click={() => drawer.setState(false)}>
                    <Icon icon={IconKey} class="text-xl" slot="leader" />
                    Accounts &amp; API Keys
                </DrawerButton>
            </ul>
        </nav>
    </ScrollPane>
    <footer>
        <ul class="p-4">
            <DrawerDivider />
            <DrawerButton href={ClientAppUrl.LogOut}
                        hoverClass="hover:bg-strawberry-300"
                        class="
                            group transition-colors duration-100
                            hover:text-gray-200 hover:font-semibold
                        ">
                <span slot=leader>
                    <Icon icon={IconLogOutHover} class="text-2xl motion-safe:group-hover:hidden" />
                    <Icon icon={IconLogOut} class="text-2xl hidden motion-safe:group-hover:block" />
                </span>
                Sign Out
            </DrawerButton>
        </ul>
    </footer>
    {/if}
</Drawer>
