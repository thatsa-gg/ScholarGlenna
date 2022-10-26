<style lang="scss">
    div {
        flex: none;
        background-color: var(--primary-background);
        box-shadow: var(--shadow-border);
        clip-path: var(--shadow-border-clip-bottom);
        z-index: var(--level-sidebar-top);
        padding-bottom: 0.25em;
        margin-bottom: 0.25em;
    }
</style>
<div>
    <slot />
</div>
