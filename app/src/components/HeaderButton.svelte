<script lang="ts">
    import type { Snippet } from "svelte"
    import { page } from "$app/stores"

    // Components
    import type { IconifyIcon } from "@iconify/utils"
    import Icon from "./Icon.svelte"

    // Properties
    let {
        href,
        icon,
        activeOn = url => url.pathname == href,
        class: classes,
        children
    }: {
        href: string
        icon?: IconifyIcon
        activeOn?: (url: URL) => boolean
        class?: string
        children: Snippet
    } = $props()

    let active = $derived(activeOn($page.url))
</script>

<li class:active class="
    relative block h-full flex-shrink-0
    after:content-[''] after:h-0.5 after:w-full after:absolute
    after:bg-blueberry-600 after:left-0 after:bottom-0 after:hidden
    { classes }
">
    <a {href} class="
        flex flex-row items-center
        gap-2 px-xl py-sm rounded-sm
        text-md/8 transition-colors
        hover:bg-primary-500
    ">
        {#if icon}
            <Icon {icon} class="fill-primary-100" />
            <span>{@render children()}</span>
        {:else}
            {@render children()}
        {/if}
    </a>
</li>

<style lang="postcss">
    li.active::after {
        @apply block;
    }
</style>
