<script lang="ts" context="module">
    import type { Load } from '@sveltejs/kit'
    type Params = { user: string }
    export const load: Load<Params> = (ctx) => {
        const { user } = ctx.params
        return {
            props: {
                user
            }
        }
    }
</script>
<script lang="ts">
    export let user: string
</script>

Info and settings for User "{user}".
