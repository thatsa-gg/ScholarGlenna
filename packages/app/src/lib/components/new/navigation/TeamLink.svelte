<script lang="ts">
    export let url: string
    export let name: string
</script>

<a href={ url }>{ name }</a>

<style lang="scss">
    a {
        display: block
    }
</style>
