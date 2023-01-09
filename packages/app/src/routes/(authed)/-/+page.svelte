<script lang="ts">
    import App from '$lib/components/new/App.svelte'
    import Contents from '$lib/components/new/navigation/Contents.svelte'
    import NavA from '$lib/components/new/navigation/NavA.svelte'
    import Navigation from '$lib/components/new/navigation/Navigation.svelte'
    import NavSection from '$lib/components/new/navigation/NavSection.svelte'
    import TeamLink from '$lib/components/new/navigation/TeamLink.svelte'
    import Section from '$lib/components/new/Section.svelte'
    import SectionTitle from '$lib/components/new/SectionTitle.svelte'
    import { faBook, faGear } from '@fortawesome/free-solid-svg-icons'

    import type { PageLoadServerData } from './$types'
    export let data: PageLoadServerData
</script>

<App name="/-/dashboard" user={data.user}>
    <Contents slot="contents">
        <NavA href="/-/builds">Builds</NavA>
        <NavA href="/-/logs" icon={faBook}>Logs</NavA>
        <NavA href="/-/settings" icon={faGear} color="var(--icon-gray)">Settings</NavA>
    </Contents>
    <Navigation slot="navigation">
        {#each data.guilds as guild}
            <NavSection title={guild.name} href={guild.url}>
                {#each guild.teams as team}
                    <TeamLink {...team} />
                {/each}
                {#if false}
                    {#each (new Array(100).fill(0).map((_, i) => ({ url: '#', name: `test ${i}` }))) as team}
                        <TeamLink {...team} />
                    {/each}
                {/if}
            </NavSection>
        {/each}
    </Navigation>

    <Section name="/-/builds">
        <SectionTitle>Builds</SectionTitle>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut fringilla nec elit a malesuada. Phasellus tincidunt cursus justo. Aliquam et aliquet lectus. Ut ullamcorper, nulla id ultricies blandit, neque nibh vestibulum risus, eget pretium erat est ac mauris. Maecenas egestas, magna non pharetra luctus, libero lorem sagittis dui, a egestas ipsum lacus non odio. Quisque sollicitudin id metus eget imperdiet. Maecenas dignissim est tempus, tempus ipsum in, condimentum massa. Fusce consequat purus et euismod scelerisque. Praesent a dignissim odio.</p>
        <p>Sed at facilisis neque. Pellentesque et sagittis dui. Quisque commodo mi nec nunc tincidunt, vitae iaculis odio tempor. Nullam eros neque, tristique in ultricies vel, elementum nec enim. Pellentesque eget suscipit felis. Nulla nibh dui, convallis maximus est in, consequat tincidunt magna. Mauris luctus ornare convallis. Morbi id venenatis dolor, quis bibendum nisi. Duis sollicitudin bibendum sem non elementum. Vivamus enim diam, auctor quis justo non, pretium malesuada nisl. Nulla in nunc lectus. Proin eu magna molestie, ullamcorper risus eu, malesuada orci. Integer eu consectetur purus, non hendrerit ligula. Sed faucibus metus et ipsum mattis interdum. Vivamus egestas non magna sit amet tempor. Mauris rhoncus sapien ante, eget pellentesque nisl tempus at.</p>
    </Section>

    <Section name="/-/settings">
        <SectionTitle>Settings</SectionTitle>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut fringilla nec elit a malesuada. Phasellus tincidunt cursus justo. Aliquam et aliquet lectus. Ut ullamcorper, nulla id ultricies blandit, neque nibh vestibulum risus, eget pretium erat est ac mauris. Maecenas egestas, magna non pharetra luctus, libero lorem sagittis dui, a egestas ipsum lacus non odio. Quisque sollicitudin id metus eget imperdiet. Maecenas dignissim est tempus, tempus ipsum in, condimentum massa. Fusce consequat purus et euismod scelerisque. Praesent a dignissim odio.</p>
        <p>Sed at facilisis neque. Pellentesque et sagittis dui. Quisque commodo mi nec nunc tincidunt, vitae iaculis odio tempor. Nullam eros neque, tristique in ultricies vel, elementum nec enim. Pellentesque eget suscipit felis. Nulla nibh dui, convallis maximus est in, consequat tincidunt magna. Mauris luctus ornare convallis. Morbi id venenatis dolor, quis bibendum nisi. Duis sollicitudin bibendum sem non elementum. Vivamus enim diam, auctor quis justo non, pretium malesuada nisl. Nulla in nunc lectus. Proin eu magna molestie, ullamcorper risus eu, malesuada orci. Integer eu consectetur purus, non hendrerit ligula. Sed faucibus metus et ipsum mattis interdum. Vivamus egestas non magna sit amet tempor. Mauris rhoncus sapien ante, eget pellentesque nisl tempus at.</p>
    </Section>

    <slot />
</App>
