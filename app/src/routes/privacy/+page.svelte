<script lang="ts">
    // Components
    import App from "$components/App.svelte"
    import CenterColumn from "$components/CenterColumn.svelte"
    import Icon from "@iconify/svelte"

    // Icons
    import IconAlert from "@iconify-icons/octicon/alert-fill-24"
</script>

<svelte:head>
    <title>Privacy | Scholar Glenna</title>
</svelte:head>

<App>
    <CenterColumn>
        <h1 class="text-center font-extrabold text-xl">Privacy and Data Usage</h1>
        <p>Scholar Glenna/thatsa.gg ("the app") stores some personal information for its function. </p>

        <h2 class="font-bold text-lg">What we store:</h2>
        <h3 class="text-center font-bold">Guilds</h3>
        <div class="bg-amber-900 text-gray-50 p-4 my-2 rounded-md flex gap-4 items-start">
            <Icon icon={IconAlert} height="none" class="flex-shrink-0 w-12" />
            <p>
                Guild information and the associated member and user records are retained for up to one week
                after the app is removed from or loses contact with a guild, to allow for outages and resuming
                operation if the app is removed and re-added. If you wish for data to be removed sooner, please
                contact us.
            </p>
        </div>
        <ul class="list-disc ml-8">
            <li>The guild ID, name and icon.</li>
            <li>The guild's vanity URL code (to provide a friendly-looking link).</li>
        </ul>
        <h3 class="text-center font-bold mt-8">Users</h3>
        <ul class="list-disc ml-8">
            <li>
                <p>The user ID, name, and avatar for:</p>
                <ul class="list-disc ml-8">
                    <li>Any user who has signed in to the app.</li>
                    <li>
                        The owner of any guilds the app is a member of (so they can be efficiently linked to
                        the guild for administrative purposes).
                    </li>
                    <li>Any user who is a member of a team.</li>
                </ul>
            </li>
            <li>
                <p>The guild member nickname and avatar on each guild the app is a member of for:</p>
                <ul class="list-disc ml-8">
                    <li>Any user who has signed in to the app and is a member of that guild.</li>
                    <li>The owner of any guilds the app is a member of (see above).</li>
                    <li>Any user who is a member of a team.</li>
                </ul>
            </li>
            <li>
                A Discord API access and refresh tokens for each active session of any user who has signed in
                to the app. These tokens are stored for no more than 30 days (the maximum duration of a session),
                and are destroyed when the user signs out of the app.
            </li>
            <li>Any Guild Wars 2 account names and API tokens provided by the user.</li>
            <li>Any build information provided by the user.</li>
            <li>Any logs provided by any user.</li>
        </ul>
    </CenterColumn>
</App>
