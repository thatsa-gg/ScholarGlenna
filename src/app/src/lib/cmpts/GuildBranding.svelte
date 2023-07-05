<script lang="ts">
    export let guild: {
        name: string
    };
</script>

<div {...$$restProps}>
    <!--
        TODO:
            1. if a guild has a logo, display the logo
            2. if a guild does not have a logo, display the acronym (svg)
            3. if the item is active, mask with a rounded rectangle
            4. if the item is inactive, mask with a circle
    -->
    <span>{guild.name}</span>
    <slot />
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
</div>

<style lang="postcss">
    div {
        grid-area: branding;
        @apply bg-primary-600 shadow-md rounded-md;
        @apply w-40;
    }
</style>
