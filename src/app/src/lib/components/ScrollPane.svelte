<script lang="ts">
    export let scrollStyle: 'auto' | 'thin' | 'none' = 'thin'
</script>

<div class={["flex flex-col h-0", $$restProps.class].filter(a => a).join(" ")}>
    <div class={`flex-auto overflow-y-auto scroll-w-${scrollStyle}`}>
        <slot />
    </div>
</div>
