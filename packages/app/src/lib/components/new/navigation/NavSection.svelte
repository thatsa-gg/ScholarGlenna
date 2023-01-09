<script lang="ts">
    export let title: string
    //export let url: string
</script>
<div>
    <h2>{title}</h2>
    <slot />
</div>

<style lang="scss">
    h2 {
        position: sticky;
        top: 0;
    }
</style>
