<script lang="ts">
    import Fa from 'svelte-fa'
    import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
</script>

<style lang="scss">
    @import "../../client/scss/variables.scss";
    a {
        display: flex;
        padding: 1rem;
        justify-content: center;
        align-items: center;

        background: var(--primary);
        color: hsl(357, 0%, 41%);

        transition: color ease $DefaultTransition;
        &:hover {
            color: hsl(357, 60%, 41%);
        }
    }
</style>

<a href="/api/logout"
    aria-label="Log Out">
    <Fa icon={faArrowRightFromBracket}
        scale="2x"
        aria-hidden="true"
        focusable="false" />
</a>
