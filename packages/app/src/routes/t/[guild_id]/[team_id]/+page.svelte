<script lang="ts">
    export let team: { name: string }
    export let permissions: {
        members: boolean,
        roles: boolean,
        edit: boolean,
        delete: boolean,
    }
</script>

<h1>{team.name}</h1>
