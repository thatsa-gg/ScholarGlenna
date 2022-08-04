<script lang="ts">
</script>
<form on:submit|preventDefault>
    <input name="name" type="text" placeholder="name"/>
    <input name="role" type="text" placeholder="role"/>
    <input name="channel" type="text" placeholder="channel"/>
    <textarea name="description" placeholder="description"></textarea>
    <label>Sync Membership with Role: <input name="sync" type="checkbox" /></label>
    <input name="alias" type="text" placeholder="custom alias"/>
<!--
    TODO times
-->
</form>
