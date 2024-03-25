<script lang="ts">
    import type { Snippet } from "svelte"
    let {
        class: classes,
        layout = "none",
        style = "simple",
        children
    }: {
        class?: string
        layout?: "none" | "grid" | "grid-header" | "row"
        style?: "simple" | "hero"
        children: Snippet
    } = $props()
</script>

<section class="
    p-4 rounded-lg bg-primary-750
    {layout == "grid-header" ? "grid gap-x-8 gap-y-4 pt-0"
        : layout == "grid" ? "grid gap-x-8"
        : layout == "row" ? "flex gap-2 sm:gap-4 items-center"
        : ""}
    {style == "hero"
        ? "border-2 border-primary-950 shadow-md shadow-primary-950"
        : ""}
    {classes}
">
    {@render children()}
</section>

<style lang="postcss">
    section.grid {
        grid-template: "header header" min-content
                       "left   right " auto
                    /  theme(width.32) auto;
    }
</style>
