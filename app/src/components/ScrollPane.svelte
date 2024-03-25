<script lang="ts">
    import type { Snippet } from "svelte"

    let { scrollStyle = "thin", class: classes, children }: {
        scrollStyle?: 'auto' | 'thin' | 'none'
        class?: string
        children: Snippet
    } = $props()
    const scrollClass = {
        auto: 'scroll-w-auto',
        thin: 'scroll-w-thin',
        none: 'scroll-w-none'
    }[scrollStyle]
</script>

<div class="flex flex-col h-0 {classes}">
    <div class="flex-auto overflow-y-auto {scrollClass}">
        <slot />
    </div>
</div>
