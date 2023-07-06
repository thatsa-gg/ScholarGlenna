<script lang="ts">
    import Drawer from './Drawer.svelte';
    import BrandingLogo from './BrandingLogo.svelte';
    import Button from './Button.svelte';
    import { X16, Home16, People16 } from 'svelte-octicons';
    import ScrollPane from './ScrollPane.svelte';
    import DrawerButton from './DrawerButton.svelte';
    import DrawerDivider from './DrawerDivider.svelte';

    import type { LayoutServerData } from './../../routes/$types'

    export let user: LayoutServerData['user']

    let drawer: Drawer
    export function open(){
        drawer.open()
    }
</script>

<Drawer
    bind:this={drawer}
    id="primary-drawer"
    animate
    class="bg-primary-900 overflow-hidden rounded-r-lg z-50 flex flex-col border-r border-primary-500"
>
    <div class="flex justify-between p-4">
        <BrandingLogo size=32 />
        <Button class="transition-colors duration-100 h-8" on:click={() => drawer.close()}>
            <X16 />
        </Button>
    </div>
    <ScrollPane scrollStyle="auto" class="flex-grow">
        <nav>
            <ul class="p-4">
                {#if user}
                    <DrawerButton href="/-/dashboard"><Home16 slot="leader"/> Dashboard</DrawerButton>
                {:else}
                    <DrawerButton href="/"><Home16 slot="leader"/> Home</DrawerButton>
                {/if}
                <DrawerButton href="/-/guilds">Guilds</DrawerButton>
                {#if user && user.guilds.length > 0}
                    <DrawerDivider />
                    {#each user.guilds as guild}
                        {#if guild.teams.length > 0}
                            <li>
                                {guild.name} +/-
                                <ul>
                                    <li>(Guild)</li>
                                    {#each guild.teams as team}
                                        <DrawerButton>
                                            {#if team.icon}
                                                TODO
                                            {:else}
                                                <People16 slot="leader" />
                                            {/if}
                                            {team.name}
                                        </DrawerButton>
                                    {/each}
                                </ul>
                            </li>
                        {:else}
                            <li>{guild.name}</li>
                        {/if}
                    {/each}
                {/if}
            </ul>
        </nav>
    </ScrollPane>
    <footer class="p-4">
        <pre>
copyright
footer links
        </pre>
    </footer>
</Drawer>
