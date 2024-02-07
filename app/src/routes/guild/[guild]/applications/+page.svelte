<script lang="ts">
    // Components
    import App from "$components/App.svelte"
</script>
todo: restrict to managers

<App>
    &gt; SmallGuildHeader />
    table of applications(filter: user, team, date, status)
        each row expands.
        next to each team in the row, accept/dismiss buttons
        button to close application (automatic if all teams are accepted)
</App>
