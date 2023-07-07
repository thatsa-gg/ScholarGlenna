<script lang="ts">
    import type { PageData } from "./$types"
    export let data: PageData
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>
<pre>
    icon                |
    username            |       table of playable roles
    # guilds . # teams  |
    region              |
    --------------------|       table of top logs
    guilds              |       -> link to user logs
    - guild             |
    - guild             |
    - guild             |
</pre>
