<script lang="ts">
    let classes: string | undefined = undefined
    export let href: string | undefined = undefined
    export let label: string | undefined = undefined
    export let spanClass: string = "inline-block"
    export { classes as class }

    export let hoverClass: `hover:bg-${string}` | false = "hover:bg-primary-500"
    export let backgroundClass: `bg-${string}` | undefined = undefined

    let classList = [classes, hoverClass, backgroundClass].filter(a => a).join(" ")
</script>

<li>
    {#if href}
        <a {href} class={classList} title={label} aria-label={label} on:click>
            {#if $$slots.leader}
                <span class="leader" aria-hidden="true"><slot name="leader"/></span>
            {/if}
            <span class={["content", spanClass].filter(a => a).join(" ")}><slot /></span>
            {#if $$slots.trailer}
                <span class="trailer" aria-hidden="true"><slot name="trailer"/></span>
            {/if}
        </a>
    {:else}
        <button class={classList} on:click aria-label={label}>
            <span class={spanClass}><slot /></span>
        </button>
    {/if}
</li>

<style lang="postcss">
    a, button {
        @apply grid no-underline px-md py-sm rounded-md items-center;
        grid-template: "leader content trailer" minmax(2rem, min-content) /
                        2rem minmax(0, auto) min-content;
        gap: 0.5rem;
    }
    span {
        @apply overflow-hidden text-ellipsis whitespace-nowrap;
        grid-area: content;
    }

    span.leader { grid-area: leader; }
    span.content { grid-area: content; }
    span.trailer { grid-area: trailer; }
</style>
