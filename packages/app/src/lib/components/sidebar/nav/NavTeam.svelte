<script lang="ts">
    export let team: {
        url: string
        name: string
    }
</script>

<style lang="scss">
a {
    display: block;
}
</style>

<a href="{team.url}" {...$$props}>{team.name}</a>
