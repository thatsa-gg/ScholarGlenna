<script lang="ts">
    import type { TeamKind } from "$lib/server/database/types"
    import { JsonBinaryToken } from "slonik/dist/tokens";

    // Properties
    export let teams: Record<string, {
        //url: string,
        teams: Array<{
            name: string
            kind: TeamKind
            url: string
        }>
    }>

    let leagues = Object.entries(teams)
    $: currentLeague = leagues[0]?.[0] ?? null

    $: kinds = Array.from(new Set(Object.values(teams[currentLeague]?.teams ?? []).map(team => team.kind)))
</script>
<div>
    {#if leagues.length <= 1}
        <div>
            {#each leagues as [ name, league ]}
                TODO: make these tabs
                <div>{name}</div>
            {/each}
        </div>
    {/if}
    <div>
        <pre>
            Filters:
                - name (text)
                - kind (if there are multiple kinds present)
                - focus (by kind)
                - level
                - region (if the guild supports more than one region, multiselect)
                - times (how to do this??)
                - membership (range select)
                - accepting applications (boolean)
        </pre>
    </div>
    {#if null !== currentLeague && teams[currentLeague].teams.length > 0}
        <div class="grid grid-template-teamtable">
            {#each teams[currentLeague].teams as team}
                <a href={team.url} class="grid grid-cols-subgrid grid-rows-1 col-span-full">
                    <span>(icon)</span>
                    <span>{team.name}</span>
                    <span>accepting applications (little badge)</span>
                    <span>member count</span>
                    <span>focus</span>
                    <span>level</span>
                    <span>times</span>
                </a>
            {/each}
        </div>
    {:else}
        <span class="block text-primary-200 text-center italic">No teams matching the search criteria.</span>
    {/if}
</div>

<style lang="postcss">
    div.grid-template-teamtable {
        grid-template: "icon name app members focus level times" 1fr
                     / 1fr   1fr  1fr 1fr     1fr   1fr   1fr;
    }
</style>
