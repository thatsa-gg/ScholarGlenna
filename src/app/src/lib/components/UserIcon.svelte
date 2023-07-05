<script lang="ts">
    export let user: {
        avatar: string
        name: string
    }
    export let size: '16' | 16 | '32' | 32 | '64' | 64 | '128' | 128 | '256' | 256 | undefined = undefined

    let src = size ? `${user.avatar}?size=${size}` : user.avatar
</script>

<img
    {src} alt={user.name} width={size} height={size}
    class="inline-block rounded-full ring-1 ring-primary-500"
/>
