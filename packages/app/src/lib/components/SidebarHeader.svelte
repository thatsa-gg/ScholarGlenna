<style lang="scss">
    div {
        background-color: var(--primary-background);
        box-shadow: var(--shadow-border);
        clip-path: var(--shadow-border-clip-bottom);
        z-index: var(--level-sidebar-top);
        &>:global(:last-child:not(:first-child)){
            padding-bottom: 0.25em;
            margin-bottom: 0.25em;
        }
    }
</style>
<div>
    <slot />
</div>
