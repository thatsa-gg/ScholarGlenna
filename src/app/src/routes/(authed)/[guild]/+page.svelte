<script lang="ts">
    import type { PageServerData } from "./$types"
    export let data: PageServerData;
</script>
<svelte:head>
    <title>{data.guild.name} - Scholar Glenna</title>
</svelte:head>

{JSON.stringify(data.guild)}

<!-- TODO
1. The guild name.
2. A brief summary of guild statistics.
3. If there is more than one division, a way to either choose between divisions or a list of divisions with links.
4. A list of teams, possibly only if there is one division.
5. A way for managers to edit the guild.
6. A link to the discord, if it is public.
7. A link to the application page.
    - pre-application:
        - Is there a GW2 account linked?
        - Are roles filled out?
        - Are you willing to lead?
        - What is your raid experience? (wing 1/2/3/4/5/6/7, IVS, EoD NM, AHCM, XJJCM, KOCM, HTCM)
    - application:
        - checkboxes on team table for teams w/ spare capacity
        - submit button
8. A link to a page where managers can view and approve/deny applications
-->
