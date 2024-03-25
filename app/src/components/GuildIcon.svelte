<script lang="ts">
    let { guild }: { guild: Glenna.Guild } = $props()
    let src: string | null = $state(guild.url.icon?.static ?? null)
</script>

<div class="transition-rounded rounded-half hover:rounded-third bg-clip-content overflow-hidden w-32 h-32 bg-primary-900">
    {#if src}
        <img {src} width="128" height="128"
            on:mouseenter={() => src = guild.url.icon?.url ?? null}
            on:mouseleave={() => src = guild.url.icon?.static ?? null}
            alt="Guild icon for {guild.name} on Discord."
        />
    {:else}
        <div class="h-full w-full" />
    {/if}
</div>
