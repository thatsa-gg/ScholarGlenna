<script lang="ts">
    import type { ActionData, PageServerData } from './$types'
    export let data: PageServerData
    export let form: ActionData
</script>
<!-- TODO: log submission form -->
<form method="post">
    <pre>{JSON.stringify(form)}</pre>
    <h2>Submit Logs</h2>
    <label for="team">Team</label>
    <select id="team" name="team" required>
        <option disabled selected value="">-- select a team --</option>
        {#each data.teams as team}
            <option value={team.snowflake}>{team.name}</option>
        {/each}
        <!-- TODO: teams -->
    </select>
    <textarea name="links" required
        autocomplete="off"
        autocorrect="off"
        placeholder="Paste dps.report or gw2wingman log links."
    />
    <input type="submit" value="Submit" />
</form>
