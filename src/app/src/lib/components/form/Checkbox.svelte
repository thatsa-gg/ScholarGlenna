<script lang="ts">

    export let id: string
    export let name: string = id
    export let checked: boolean = false
</script>

<label {...$$restProps}>
    <input type="checkbox" {id} {name} bind:checked={checked} />
    <span><slot /></span>
</label>
