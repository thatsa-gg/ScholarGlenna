<script lang="ts">
    import { page } from "$app/stores"

    // Components
    import type Drawer from "./Drawer.svelte"
    import BrandingLogo from "./BrandingLogo.svelte"
    import Crumb from "./Crumb.svelte"
    import UserIcon from "./UserIcon.svelte"
    import DiscordLoginButtonLink from "./DiscordLoginButtonLink.svelte"
    import Icon from "@iconify/svelte"

    // Icons
    import IconMenu from "@iconify-icons/majesticons/menu"

    // Properties
    export let primaryDrawer: Drawer
    export let profileDrawer: Drawer
    let context = $page.data.context
    let user = $page.data.sessionUser
</script>
<div class="flex flex-row p-4 gap-2 pb-2 last:pb-4">
    <div class="flex flex-row flex-auto gap-2 h-8">
        <button on:click={() => primaryDrawer.setState(true)} class="
            mr-2
            border border-primary-500 rounded-md hover:border-primary-50
            transition-colors duration-100
        ">
            <Icon icon={IconMenu} class="text-3xl" />
        </button>
        <a href="/" aria-label="Home" class="flex-shrink-0"><BrandingLogo size=32/></a>
        <nav class="grid" aria-label="Page context">
            <ul class="list-none flex flex-row">
                {#each context as part, idx}
                    {#if idx === context.length - 1}
                        <li class="flex items-center text-base font-bold">
                            <Crumb href={part.href}>{part.name}</Crumb>
                        </li>
                    {:else}
                        <li class="
                            hidden sm:flex items-center text-sm
                            after:content-['/'] after:inline-block
                            after:text-xl after:px-1 after:font-light
                        ">
                            <Crumb href={part.href}>{part.name}</Crumb>
                        </li>
                    {/if}
                {/each}
            </ul>
        </nav>
    </div>
    <div class="flex flex-row gap-2">
        <button>TODO search</button>
        {#if user}
            <button on:click={() => profileDrawer.setState(true)} aria-label="Open user account menu">
                <UserIcon {user} size=32 />
            </button>
        {:else}
            <DiscordLoginButtonLink />
        {/if}
    </div>
</div>
