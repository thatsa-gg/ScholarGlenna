<script lang="ts">
    export let tip: string | undefined = undefined;
</script>

<span title={tip}><slot/></span>

<style lang="postcss">
    span {

    }
</style>
