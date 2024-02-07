<script lang="ts">
    export let layout: "none" | "grid" | "grid-header" | "row" = "none"
    export let style: "simple" | "hero" = "simple"
    let classes: string | undefined = undefined
    export {
        classes as class
    }
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
    <slot />
</section>

<style lang="postcss">
    section.grid {
        grid-template: "header header" min-content
                       "left   right " auto
                    /  theme(width.32) auto;
    }
</style>
