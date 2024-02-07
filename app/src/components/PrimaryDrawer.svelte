<script lang="ts">
    import { page } from "$app/stores"

    // Components
    import BrandingLogo from "./BrandingLogo.svelte"
    import Drawer from "./Drawer.svelte"
    import DrawerButton from "./DrawerButton.svelte"
    import DrawerDivider from "./DrawerDivider.svelte"
    import Icon from "@iconify/svelte"
    import ScrollPane from "./ScrollPane.svelte"
    import CloseDrawerButton from "./CloseDrawerButton.svelte"

    // Icons
    import IconHome from "@iconify-icons/octicon/home-16"

    // Properties
    export let drawer: Drawer = undefined! // bound below
    let user = $page.data.sessionUser
</script>

<Drawer id="primary-drawer" bind:this={drawer}>
    <div class="flex justify-between p-4 pb-0">
        <BrandingLogo size="32" />
        <CloseDrawerButton {drawer} />
    </div>
    <ScrollPane class="flex-grow">
        <nav>
            <ul class="p-4">
                {#if user}
                    <DrawerButton href={user.url.user}>
                        <Icon icon={IconHome} class="text-2xl" slot="leader" />
                        My Profile
                    </DrawerButton>
                {:else}
                    <DrawerButton href="/">
                        <Icon icon={IconHome} class="text-2xl" slot="leader" />
                        Home
                    </DrawerButton>
                {/if}
                <DrawerButton href="/guilds">Guilds</DrawerButton>
                {#if user && user.guilds.length > 0}
                    <DrawerDivider />
                    {#each user.guilds as guild}
                        {#if guild.teams.length <= 0}
                            <li>{guild.name}</li>
                        {:else}
                            <li>
                                {guild.name} +/-
                                <ul>
                                    <li>(Guild)</li>
                                    {#each guild.teams as team}
                                        <DrawerButton>
                                            {#if team.icon}
                                                TODO
                                            {:else}
                                                people icon
                                            {/if}
                                            {team.name}
                                        </DrawerButton>
                                    {/each}
                                </ul>
                            </li>
                        {/if}
                    {/each}
                {/if}
            </ul>
        </nav>
    </ScrollPane>
    <footer class="p-4 text-sm flex flex-col">
        <span>&copy; 2024 thatsa.gg</span>
        <a href="/privacy" class="hover:underline hover:text-primary-50">Privacy and Data Usage</a>
        <span>TODO: credit<br/>contact</span>
        <!-- TODO: brief copyright, credits, contact -->
    </footer>
</Drawer>

