<script lang="ts">
    let classes: string | undefined = undefined;
    export let href: string | undefined = undefined;
    export let label: string | undefined = undefined;
    export let spanClass: string = "inline-block";
    export { classes as class };

    export let hoverClass: `hover:bg-${string}` | false = "hover:bg-primary-500";
    export let backgroundClass: `bg-${string}` | undefined = undefined;

    let classList = [classes, hoverClass, backgroundClass].filter(a => a).join(" ")
</script>

{#if href}
    <a {href} class={classList} title={label} aria-label={label}>
        <span class={spanClass}><slot /></span>
    </a>
{:else}
    <button class={classList} on:click aria-label={label}>
        <span class={spanClass}><slot /></span>
    </button>
{/if}

<style lang="postcss">
    a, button {
        @apply flex items-center no-underline
            px-md py-sm rounded-md
        ;
    }
    button {
        @apply px-lg;
    }
    span {
        @apply overflow-hidden text-ellipsis whitespace-nowrap;
    }
</style>
