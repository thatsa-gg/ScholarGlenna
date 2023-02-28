<script lang="ts">
    export let name: string
    export let color: string | undefined = undefined
    export let contrastColor: string | undefined = undefined
    export let icon: string | undefined = undefined
</script>

<h1 style:background={color} style:color={contrastColor}>
    {#if icon}
        <img src={icon} alt={name} />
    {/if}
    {name}

</h1>

<style>
    h1 {
        display: flex;
        flex-direction: row;
        align-items: center;

        margin: 0;
        padding: 0.25em;
    }
</style>
