<script lang="ts">
    export let href: string
    export let label: string | undefined = undefined
    export let padding: string = "px-md py-sm"
    export let external: boolean = false

    let classes: string = ""
    export {
        classes as class
    }
</script>

<a {href} title={label} aria-label={label}
    class="{padding} {classes}"
    target={external ? "_blank" : undefined}
>
    <slot />
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
