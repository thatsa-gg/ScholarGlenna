<style lang="scss">
    div {
        background-color: var(--primary-background);
        box-shadow: var(--shadow-border);
        clip-path: var(--shadow-border-clip-bottom);
        z-index: var(--level-sidebar-top);
        min-height: 10em;
    }
</style>
<div>
    <slot />
</div>
