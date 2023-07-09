<script lang="ts">
    import Drawer from '../Drawer.svelte';
    import Button from '../Button.svelte';
    import { X16, SignOut16, Person16, Log16, Gear16, Tools16, Key16 } from 'svelte-octicons';
    import UserIcon from '../UserIcon.svelte';
    import ScrollPane from '../ScrollPane.svelte';
    import DrawerDivider from '../DrawerDivider.svelte';
    import DrawerButton from '../DrawerButton.svelte';

    let drawer: Drawer
    export function open(){
        drawer.open()
    }

    import type { LayoutServerData } from '../../../routes/$types'
    export let user: LayoutServerData['user'];
</script>

{#if user}
    <Drawer bind:this={drawer} id="user-drawer"
        animate placement='right'
        class="bg-primary-900 overflow-hidden rounded-l-lg z-50 flex flex-col border-l border-primary-500"
    >
        <div class="flex justify-between items-center p-4">
            <span class="flex gap-2">
                <UserIcon user={user} size=32 />
                <span class="block overflow-hidden text-ellipsis whitespace-nowrap font-semibold">{user.name}</span>
            </span>
            <Button class="transition-colors duration-100 h-8" on:click={() => drawer.close()}>
                <X16 />
            </Button>
        </div>
        <ScrollPane scrollStyle="auto" class="flex-grow">
            <nav>
                <ul class="p-4">
                    <DrawerButton href={`/@${user.alias}`}><Person16 slot="leader" /> Your Profile</DrawerButton>
                    <DrawerButton href={`/@${user.alias}/logs`}><Log16 slot="leader" /> Your Logs</DrawerButton>
                    <DrawerDivider />
                    <DrawerButton href="/settings"><Gear16 slot="leader" /> Account Settings</DrawerButton>
                    <DrawerButton href="/settings/builds"><Tools16 slot="leader" /> Builds</DrawerButton>
                    <DrawerButton href="/settings/accounts"><Key16 slot="leader" /> Accounts &amp; API Keys</DrawerButton>
                </ul>
            </nav>
        </ScrollPane>
        <footer>
            <ul class="p-4">
                <DrawerDivider />
                <DrawerButton
                    href="/auth/signout"
                    hoverClass="hover:bg-strawberry-300"
                    class="hover:text-gray-200 hover:font-semibold transition-colors duration-100"
                >
                    <SignOut16 slot="leader" />
                    Sign Out
                </DrawerButton>
            </ul>
        </footer>
    </Drawer>
{/if}
