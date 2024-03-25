<script lang="ts">
    import SectionCard from "$components/SectionCard.svelte"
    import { debouncer } from "$lib/client/debounce"
    import { FormState } from "$lib/client/form"
    import { enhance } from "$app/forms"

    let form: HTMLFormElement
    let formState = $state(FormState.Initial)
    const debounce = debouncer(250, () => formState = FormState.Pending)
</script>

<SectionCard id="builds">
    <h2>Builds</h2>

    <form method="post" action="/settings/builds" bind:this={form}
        use:enhance={() => {
            formState = FormState.Pending
            return async ({ update, result }) => {
                await update({ reset: false })
                formState = result.type === "success"
                    ? FormState.Complete
                    : FormState.Failed
            }
        }}
        onchange={() => debounce.try(() => form.requestSubmit())}
    >
        <input type="hidden" name="form-id" value="builds" />
        <input type="checkbox" name="dps-power" />

        <input type="submit" />
    </form>
<pre>
                Condi   Power
    Pure DPS
    QuickDPS
    Alac DPS

                Heal    Tank
    Quick
    Alac

    HandKite
    SHPush
    QadimKite
    QadimLamp
    PylonKite
</pre>
    todo
</SectionCard>
