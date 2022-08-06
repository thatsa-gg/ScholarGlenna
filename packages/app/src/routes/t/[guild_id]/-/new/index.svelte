<script lang="ts" context="module">
</script>
<script lang="ts">
    let errors: string[] | null = null
    async function submit(event: SubmitEvent){
        const form = event.target
        if(!(form && form instanceof HTMLFormElement))
            return
        const data = new FormData(form)
        const body = JSON.stringify({
            name: data.get('name'),
            alias: data.get('alias'),
            role: data.get('role'),
            channel: data.get('channel'),
            description: data.get('description'),
            sync: data.get('sync') === 'on',
        })
        const result = await fetch(`./submit`, { method: 'POST', body })
        console.log(result)
        if(result.status === 200){
            const data = await result.json()
            errors = data.errors
        }
    }
</script>
{#if errors}
<ul>
    {#each errors as err}
        <li>{err}</li>
    {/each}
</ul>
{/if}
<form on:submit|preventDefault={submit}>
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
