<script lang="ts">
    // Components
    import App from "$components/App.svelte"
    import CenterColumn from "$components/CenterColumn.svelte";
    import LogView from "$components/LogView.svelte"
    import ProfileHeader from "$components/ProfileHeader.svelte"
    import UserBanner from "$components/UserBanner.svelte"
    import UserRoles from "$components/UserRoles.svelte"

    // Properties
    import type { PageData } from "./$types"
    export let data: PageData
</script>

<svelte:head>
    <title>@{data.user.name} | Scholar Glenna</title>
</svelte:head>

<App>
    <ProfileHeader user={data.user} slot="header" />
    <CenterColumn>
        <UserBanner hero user={data.user} />
        (relation to session user here: common guilds/leagues/teams)
        <UserRoles user={data.user} />
        <LogView context="user" user={data.user} logs={data.logs} />
        user info, if visible:

        - Discord
        - Linked Accounts (if visible)
        - Server Membership
            - Common Servers (always visible)
            - Other Servers (if servers are visible and the user allows this)
        - Recent Logs (if visible)
        - Team Memberships (if visible)
            - League Memberships

        make this a component:
        <user info cards>
            <section>
                guilds / teams / leagues
            </section>
            <section>
                <a href={data.sessionUser?.url.logs}>all your logs</a>
                your logs (summary)
            </section>
        </user>
    </CenterColumn>
</App>
