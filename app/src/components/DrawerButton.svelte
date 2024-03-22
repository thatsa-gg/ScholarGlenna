<script lang="ts">
    import type { Snippet } from "svelte"
    let {
        href, label, class: classes, backgroundClass,
        spanClass = "inline-block",
        hoverClass = "hover:bg-primary-500",
        onclick,
        children, leader, trailer
    }: {
        href?: string
        label?: string
        class?: string
        spanClass?: string
        hoverClass?: `hover:bg-${string}` | false
        backgroundClass?: `bg-${string}`
        onclick?: () => void,
        leader?: Snippet,
        children: Snippet,
        trailer?: Snippet,
    } = $props()

    let classList = [classes, hoverClass, backgroundClass].filter(a => a).join(" ")
</script>

<li>
    {#if href}
        <a {href} class={classList} title={label} aria-label={label} {onclick}>
            {#if leader}
                <span class="leader" aria-hidden="true">{@render leader()}</span>
            {/if}
            <span class={["content", spanClass].filter(a => a).join(" ")}>{@render children()}</span>
            {#if trailer}
                <span class="trailer" aria-hidden="true">{@render trailer()}</span>
            {/if}
        </a>
    {:else}
        <button class={classList} {onclick} aria-label={label}>
            <span class={spanClass}>{@render children()}</span>
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
