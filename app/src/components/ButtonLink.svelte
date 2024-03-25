<script lang="ts">
    import type { Snippet } from "svelte"
    let {
        class: classes = "",
        href,
        label,
        padding = "px-md py-sm",
        external = false,
        children
    }: {
        class?: string
        href: string
        label?: string
        padding?: string
        external?: boolean
        children: Snippet
    } = $props()
</script>

<a {href} title={label} aria-label={label}
    class="{padding} {classes}"
    target={external ? "_blank" : undefined}
>
    {@render children()}
</a>

<style lang="postcss">
    a {
        @apply inline-flex
            place-items-center
            rounded-md
            text-ellipsis
            whitespace-nowrap
            overflow-hidden;
    }
    a>:global(*) {
        flex: 1;
    }
</style>
