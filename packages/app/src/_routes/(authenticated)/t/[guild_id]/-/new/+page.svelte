<script lang="ts">
    import type { ActionData } from './$types'
    export let form: ActionData
</script>
{#if !form?.success}
<ul>
    {#each form?.notes as note}
        <li>{note}</li>
    {/each}
</ul>
{/if}
<form method="POST">
    <input name="name" type="text" placeholder="name"/>
    <input name="role" type="text" placeholder="role"/>
    <input name="channel" type="text" placeholder="channel"/>
    <textarea name="description" placeholder="description"></textarea>
    <label>Sync Membership with Role: <input name="sync" type="checkbox" /></label>
    <input name="alias" type="text" placeholder="custom alias"/>
<!--
    TODO times
-->
    <input type="submit"/>
</form>

<style lang="scss">
    form>input, form>label, form>textarea { display: block }
</style>
