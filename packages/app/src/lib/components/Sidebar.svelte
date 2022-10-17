<script lang="ts">
    import Button from '$lib/components/Button.svelte'
    import ButtonGroup from '$lib/components/Button.svelte'
</script>

<style lang="scss">
    nav {
        background-color: var(--secondary-background);
        box-shadow: var(--shadow-border);
        z-index: var(--level-sidebar);
    }
    .top {
        background-color: var(--primary-background);
        min-height: 10em;
    }
</style>

<nav>
    <slot></slot>
</nav>
<!-- TODO: sidebar with navigation. use stores to communicate with current page. -->
