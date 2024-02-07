<script lang="ts">
    import { page } from "$app/stores"

    // Components
    import Icon, { type IconifyIcon } from "@iconify/svelte"

    // Properties
    export let href: string
    export let icon: IconifyIcon | undefined = undefined
    export let activeOn: (url: URL) => boolean = url => url.pathname == href
    let classes: string | undefined = undefined
    export { classes as class }

    $: active = activeOn($page.url)
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
            <span><slot /></span>
        {:else}
            <slot />
        {/if}
    </a>
</li>

<style lang="postcss">
    li.active::after {
        @apply block;
    }
</style>
