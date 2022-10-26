<script lang="ts">
</script>

<style lang="scss">
    nav {
        background-color: var(--secondary-background);
        box-shadow: var(--shadow-border);
        z-index: var(--level-sidebar);
    }
</style>

<nav>
    <slot></slot>
</nav>
<!-- TODO: sidebar with navigation. use stores to communicate with current page. -->
