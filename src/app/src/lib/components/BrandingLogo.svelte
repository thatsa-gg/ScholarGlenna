<script lang="ts">
    export let size: '32' | '64' | '128' | '256' | '512' | 32 | 64 | 128 | 256 | 512 = '32'
    export let id: string | undefined = undefined;
</script>

<img
    {id}
    alt="/gg"
    width={size}
    height={size}
    src={`/images/icon-${size}.png`}
    aria-hidden="true"
/>
