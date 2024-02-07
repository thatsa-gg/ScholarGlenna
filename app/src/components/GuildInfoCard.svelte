<script lang="ts">
    // Components
    import Card from "./Card.svelte"
    import CardHeader from "./CardHeader.svelte"
    import ButtonLink from "./ButtonLink.svelte"
    import GuildIcon from "./GuildIcon.svelte"
    import Icon from "@iconify/svelte"
    import LabeledBox from "./LabeledBox.svelte"

    // Icons
    import IconArrowRight from "@iconify-icons/octicon/arrow-right-16"
    import IconDiscord from "@iconify-icons/bi/discord"
    import IconLink from "@iconify-icons/octicon/link-external-16"
    import IconNARegion from "@iconify-icons/bi/globe-americas"
    import IconEURegion from "@iconify-icons/circle-flags/european-union"
    import IconUnknownRegion from "@iconify-icons/octicon/circle-slash-16"

    // Properties
    export let guild: Glenna.Guild
    export let showGuildPageLink: boolean = false
    export let style: "simple" | "hero" = "simple"

    let isNARegion = guild.serverRegion?.includes("na") ?? false
    let isEURegion = guild.serverRegion?.includes("eu") ?? false
</script>

<Card {style} layout={showGuildPageLink ? "grid-header" : "grid"}>
    {#if showGuildPageLink}
    <CardHeader>
        <ButtonLink href={guild.url.guild}
            padding="px-4 py-1"
            class="ml-auto transition-colors hover:bg-primary-500"
        >
            <span>Go to Guild</span>
            <Icon icon={IconArrowRight} class="text-2xl" />
        </ButtonLink>
    </CardHeader>
    {/if}
    <div class="area-left flex flex-col gap-2">
        <GuildIcon {guild} />
        <h2 class="font-bold text-center">{guild.name}</h2>
        {#if guild.url.invite}
            <ButtonLink
                href={guild.url.invite} external
                label="Visit {guild.name} on Discord"
                class="transition-colors duration-100 bg-primary-500 hover:bg-blueberry"
            >
                <Icon icon={IconDiscord} />
                <span>Discord</span>
                <Icon icon={IconLink} />
            </ButtonLink>
        {/if}

    </div>
    <div class="area-right flex flex-col gap-1">
        <div class="p-4 mb-4 flex-grow bg-primary-900 rounded-lg">
            {#if guild.description}
                <span class="text-sm italic text-primary-100">Description from Discord:</span>
                <blockquote class="px-2 pt-2">
                    {guild.description}
                </blockquote>
            {:else}
                <span class="text-sm italic text-primary-100">This guild has no description.</span>
            {/if}
        </div>
        <div class="grid sm:flex flex-row flex-wrap gap-2">
            <LabeledBox label="Server Region" contentClass="px-3">
                {#if isEURegion || isNARegion}
                    <span
                        title={isNARegion ? "America" : undefined}
                        aria-hidden={!isNARegion}
                        class={isNARegion ? "text-green-600" : "text-primary-500"}
                    ><Icon icon={IconNARegion} class="text-2xl" /></span>
                    <span
                        title={isEURegion ? "Europe" : undefined}
                        aria-hidden={!isEURegion}
                        class={isEURegion ? undefined : "opacity-50 saturate-0"}
                    ><Icon icon={IconEURegion} class="text-2xl" /></span>
                {:else}
                    <span title="Unknown" class="text-primary-200 px-4">
                        <Icon icon={IconUnknownRegion} class="text-xl" />
                    </span>
                {/if}
            </LabeledBox>
            {#if guild.count.leagues > 1}
                <LabeledBox label="Leagues" contentClass="min-w-16 justify-end">{guild.count.leagues}</LabeledBox>
            {/if}
            <LabeledBox label="Teams" contentClass="min-w-16 justify-end">{guild.count.teams}</LabeledBox>
            <LabeledBox label="Team Members" contentClass="min-w-16 justify-end">{guild.count.members}</LabeledBox>
        </div>
        <div>
        </div>
    </div>
</Card>

<style lang="postcss">
    div.grid {
        grid-template-rows: min-content;
        grid-template-columns: repeat(minmax(max-content, 50%), 2);
    }
</style>
