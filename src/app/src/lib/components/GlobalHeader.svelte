<script lang="ts">
    import { page } from '$app/stores';
    import Button from './Button.svelte';
    import BrandingLogo from './BrandingLogo.svelte';
    import DiscordLogin from './DiscordLogin.svelte';
    import { ThreeBars16 } from 'svelte-octicons';
    import PrimaryDrawer from './drawers/PrimaryDrawer.svelte';
    import UserDrawer from './drawers/UserDrawer.svelte';
    import UserIcon from './UserIcon.svelte';
    import type { LayoutServerData } from './../../routes/$types';
    export let user: LayoutServerData['user'];

    $: context = $page.data.context || [ { name: "Scholar Glenna", href: "/" } ]

    let primaryDrawer: PrimaryDrawer
    let userDrawer: UserDrawer | undefined
</script>

<PrimaryDrawer bind:this={primaryDrawer} {user} />
<UserDrawer bind:this={userDrawer} {user} />

<div class="flex flex-row p-4 gap-2 pb-2 last:pb-4">
    <div class="flex flex-row flex-auto gap-2">
        <Button
            hoverClass={false}
            class="border border-primary-500 hover:border-primary-50 transition-colors duration-100 mr-2"
            on:click={primaryDrawer.open}
        >
            <ThreeBars16 />
        </Button>
        <a
            href="/"
            aria-label="Home"
        >
            <BrandingLogo size=32 />
        </a>
        <nav class="grid" aria-label="Page content">
            <ul class="list-none flex flex-row">
                {#each context as part, idx}
                    <li class="flex items-center text-sm last:text-base last:font-bold">
                        {#if idx === context.length - 1}
                            <Button href={part.href}>{part.name}</Button>
                        {:else}
                            <Button href={part.href} spanClass="underline decoration-primary-200 hover:no-underline">{part.name}</Button>
                        {/if}
                    </li>
                {/each}
            </ul>
        </nav>
    </div>
    <div class="flex flex-row gap-2">
        <button>search (style like input)</button>
        {#if user}
            <button on:click={() => userDrawer?.open()} aria-label="Open user account menu">
                <UserIcon user={user} size=32 />
            </button>
        {:else}
            <DiscordLogin />
        {/if}
    </div>
</div>

<style lang="postcss">
    li:not(:last-child) {
        &::after {
            content: "/";
            display: inline-block;
            @apply text-xl px-1 font-light;
        }
    }
</style>
