<script lang="ts">
    export let user: Glenna.User
    export let size: Optional<'16' | 16 | '32' | 32 | '64' | 64 | '128' | 128 | '256' | 256> = undefined

    let src = size ? `${user.url.avatar}?size=${size}` : user.url.avatar
</script>

<img
    {src} alt={user.name} width={size} height={size}
    class="inline-block rounded-full ring-1 ring-primary-500"
/>
