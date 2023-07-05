<script lang="ts">
    export let background: string | undefined = undefined
    export let color: string | undefined = undefined
</script>

<style lang="scss">
    h1 {
        margin: 0;
        padding: 0.25em;
    }
</style>

<h1 style:background style:color>
    <slot name="icon" />
    <slot />
</h1>
