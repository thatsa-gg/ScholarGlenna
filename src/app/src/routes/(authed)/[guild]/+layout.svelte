<script lang="ts">
    import type { LayoutServerData } from "./$types";
    export let data: LayoutServerData;

    import GuildBranding from "$lib/components/GuildBranding.svelte";
</script>

<GuildBranding guild={data.guild}>
    <span><!-- discord link --></span> <!-- TODO: if enabled in settings! -->
    <!-- gap -->
    <!-- if a member of the guild -->
        <!-- if no application -->
            <span><!-- apply button --></span>
        <!-- else -->
            <span><!-- edit application button --></span>
        <!-- endif -->
    <!-- else -->
        <span><!-- join button (directs to discord) --></span>
    <!-- end if -->
</GuildBranding>

<slot />

<style lang="postcss">
</style>
