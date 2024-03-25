<script lang="ts">
    import type { Size } from "$lib/client/size"
    let { user, size }: {
        user: Glenna.User
        size?: Size<16 | 32 | 64 | 128 | 256>
    } = $props()
    let src = size ? `${user.url.avatar}?size=${size}` : user.url.avatar
</script>

<img
    {src} alt={user.name} width={size} height={size}
    class="inline-block rounded-full ring-1 ring-primary-500"
/>
