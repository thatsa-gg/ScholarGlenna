<script lang="ts">

    export let id: string
    export let name: string = id
    export let checked: boolean = false
</script>

<input type="checkbox" {id} {name} {checked} />
<label for={id}><slot /></label>
