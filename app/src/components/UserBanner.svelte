<script lang="ts">
    import Card from "./Card.svelte"
    import UserIcon from "./UserIcon.svelte"

    let { hero = false, user }: {
        hero?: boolean
        user: Glenna.User
    } = $props()
</script>

<Card>
    {#if hero}
        <UserIcon {user} size="128" />
        <h1>{user.name}</h1>
    {:else}
        <UserIcon {user} size="64" />
        <h2>{user.name}</h2>
    {/if}
</Card>



<section class="row">
    <user icon />
    <block column>
        <user name />
        <user badges /> <!-- eg: Voidwalker, Voice in the Void, Slippery Slubling, Nightmare Aspect -->
        <links>
            - kp.me
            - gw2wingman
        </links>
    </block>
    <block column>
        <regions />
        <languages />
        <time class="zone" />
        <accounts />
    </block>
</section>
