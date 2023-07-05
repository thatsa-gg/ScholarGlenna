<script lang="ts">
    import Badge from "$lib/components/Badge.svelte";
    import type { PageServerData } from "./$types";
    export let data: PageServerData;

    import { teamRegionToBadgeName } from '$lib/util';
    import Time from "$lib/components/Time.svelte";
</script>
<!-- TODO: division selector -->
{#if data.permissions.createTeam}
    <!-- TODO: box for team creation -->
{/if}
<div class="content">
    <table>
        <thead>
            <tr>
                <th>Team</th>
                <th>Region</th>
                <th>Focus</th>
                <th>Time</th>
                <th>Roster Size</th>
            </tr>
        </thead>
        <tbody>
            {#each data.teams as team}
                <tr>
                    <td><a href={`/${data.guild.alias}/${team.alias}`}>{team.name}</a></td>
                    <td><Badge>{teamRegionToBadgeName(team.region)}</Badge></td>
                    <td>{team.focus}</td>
                    <td>{#each team.times as time}<Time timestamp={time.timestamp} duration={time.duration} />{/each}</td>
                    <td>
                        {#if null !== team.capacity}
                            {team.members}/{team.capacity}
                        {:else}
                            {team.members}/<span title="This team has unlimited capacity.">∞</span>
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style lang="postcss">
    div.content {
        grid-area: content;
        @apply bg-primary-600 shadow-md justify-self-center w-md h-min;
        @apply w-md md:w-sm sm:w-full transition-width ease-linear;
    }
</style>
