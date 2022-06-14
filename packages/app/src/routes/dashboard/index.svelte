<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'
    export const load: Load = ({session}) => ({
        props: {
            user: session.user || false
        }
    })
</script>
<script lang="ts">
    import { onMount } from 'svelte'
    export let user: false | Record<string, string>
    console.log(user)

    export let demo: boolean = false
    onMount(() => {
        setTimeout(() => {
            demo = true
        }, 10000)
    })
</script>

TODO {JSON.stringify(user)}
<p>
    {#if false === user}
        Loading...
    {:else}
        Completed! ({user.username})
    {/if}
</p>
