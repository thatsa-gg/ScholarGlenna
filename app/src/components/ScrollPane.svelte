<script lang="ts">
    export let scrollStyle: 'auto' | 'thin' | 'none' = 'thin'
    const scrollClass = {
        auto: 'scroll-w-auto',
        thin: 'scroll-w-thin',
        none: 'scroll-w-none'
    }[scrollStyle]
</script>

<div class="flex flex-col h-0 {$$restProps.class}">
    <div class="flex-auto overflow-y-auto {scrollClass}">
        <slot />
    </div>
</div>
