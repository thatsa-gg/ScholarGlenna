<script lang="ts">
    import type { PageData } from "./$types"
    import { afterNavigate, disableScrollHandling } from "$app/navigation"
    import { ClientAppUrl } from "$lib/url"

    // Components
    import App from "$components/App.svelte"
    import CenterColumn from "$components/CenterColumn.svelte"
    import SettingsHeader from "$components/SettingsHeader.svelte"
    import SectionCard from "$components/SectionCard.svelte"
    import Builds from "./(builds)/Builds.svelte"

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

<svelte:head>
    <title>{data.title} | Scholar Glenna</title>
</svelte:head>

<App>
    {#snippet header()}
        <SettingsHeader />
    {/snippet}
    <CenterColumn>
        <pre>
        Current section: {data.pageSection ?? "(none)"}
        </pre>

        <Builds />
        <SectionCard id="accounts">
            <h2>Accounts</h2>
            todo
        </SectionCard>
    </CenterColumn>
</App>
