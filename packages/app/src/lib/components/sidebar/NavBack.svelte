<script lang="ts">
    export let to: {
        url: string
        name: string
    }
</script>

<style lang="scss">
a {
    display: block;
}
</style>

<a href="{to.url}">{to.name}</a>
