<script lang="ts">
    export let user: { avatar: string, name: string }
</script>

<div class="h-full">
    <img src={user.avatar} alt={user.name} class="rounded-full h-full" />
</div>

<!-- TODO: have a dropdown menu that pops out from here and overlays the header area -->
