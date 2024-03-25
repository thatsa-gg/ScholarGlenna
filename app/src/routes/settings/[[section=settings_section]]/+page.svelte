<script lang="ts">
    import type { PageData } from "./$types"
    import { afterNavigate, disableScrollHandling } from "$app/navigation"
    import { ClientAppUrl } from "$lib/url"

    // Components
    import App from "$components/App.svelte"
    import CenterColumn from "$components/CenterColumn.svelte"
    import SettingsHeader from "$components/SettingsHeader.svelte"

    // Properties
    let { data }: { data: PageData } = $props()

    afterNavigate(nav => {
        disableScrollHandling()
        const isInPage = nav.from?.url.pathname.startsWith(ClientAppUrl.Settings) ?? false
        if(data.pageSection){
            const element = document.getElementById(data.pageSection)
            element?.scrollIntoView({ behavior: isInPage ? 'smooth' : 'instant' })
        } else {
            window.scrollTo({ top: 0, behavior: isInPage ? 'smooth' : 'instant' })
        }
    })
</script>

<App>
    <SettingsHeader slot="header" />
    <CenterColumn>
        <pre>
        Current section: {data.pageSection ?? "(none)"}

        individual user settings

        - accounts
        - builds
        </pre>

        <div id="builds" class="bg-slate-600 h-96 mb-12">
            <h2>Builds</h2>
            todo
        </div>

        <div id="accounts" class="bg-slate-600 h-96">
            <h2>Accounts</h2>
            todo
        </div>
    </CenterColumn>
</App>
