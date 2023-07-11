<script lang="ts">
    import type { ActionData, PageData } from "./$types"
    import { enhance } from "$app/forms"
    import { Debouncer } from "$lib/client/debounce"
    import Checkbox from "$lib/components/form/Checkbox.svelte"
    import Button from "$lib/components/Button.svelte"
    import { Check16, Alert16 } from "svelte-octicons"
    import Fa from "svelte-fa"
    import { faSpinner } from "@fortawesome/free-solid-svg-icons"

    export let data: PageData
    export let form: ActionData
    $: roles = form?.roles ?? data.roles

    let formElement: HTMLFormElement
    let formState: 'pending' | true | false

    const debouncer = new Debouncer(250, {
        onEnter(){ formState = "pending" }
    })
</script>
<form method="post" bind:this={formElement} use:enhance={() => {
    formState = "pending"
    return async ({ update, result }) => {
        await update({ reset: false })
        formState = result.type === "success"
    }
}} on:change={() => debouncer.debounce(() => formElement.requestSubmit())}>
    <div class="flex flex-row justify-between">
        <h1 class="text-3xl">Builds</h1>
        <div class="grid items-center">
            {#if formState === 'pending'}
                <Fa icon={faSpinner} spin class="text-primary-200" />
            {:else if formState === false}
                <Alert16 class="fill-amber-700" />
            {:else if formState !== undefined}
                <Check16 class="fill-green-600" />
            {/if}
        </div>
    </div>
    <hr />

    <table class="w-full">
        <thead>
            <tr>
                <th colspan="2" aria-hidden="true"></th>
                <th class="bg-blueberry-900 rounded-l-md">Pure</th>
                <th class="bg-blueberry-900">Alacrity</th>
                <th class="bg-blueberry-900 rounded-r-md">Quickness</th>
            </tr>
        </thead>
        <tbody class="text-left">
            <tr aria-hidden="true"><td colspan="5"><div class="h-3"></div></td></tr>
            <tr>
                <th rowspan="2">Heal</th>
                <th>Pure</th>
                <td><Checkbox id="heal" checked={roles.heal} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Heal</Checkbox></td>
                <td><Checkbox id="heal-alacrity" checked={roles.healAlacrity} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Heal Alac</Checkbox></td>
                <td><Checkbox id="heal-quickness" checked={roles.healQuickness} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Heal Quick</Checkbox></td>
            </tr>
            <tr>
                <th>Tank</th>
                <td><Checkbox id="heal-tank" checked={roles.healTank} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Heal Tank</Checkbox></td>
                <td><Checkbox id="heal-tank-alacrity" checked={roles.healTankAlacrity} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Heal Tank Alac</Checkbox></td>
                <td><Checkbox id="heal-tank-quickness" checked={roles.healTankQuickness} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Heal Tank Quick</Checkbox></td>
            </tr>
            <tr aria-hidden="true"><td colspan="5"><hr /></td></tr>
            <tr>
                <th rowspan="3">DPS</th>
                <th>Power</th>
                <td><Checkbox id="dps-power" checked={roles.dpsPower} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">PDPS</Checkbox></td>
                <td><Checkbox id="dps-power-alacrity" checked={roles.dpsPowerAlacrity} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">PDPS Alac</Checkbox></td>
                <td><Checkbox id="dps-power-quickness" checked={roles.dpsPowerQuickness} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">PDPS Quick</Checkbox></td>
            </tr>
            <tr>
                <th>Condition</th>
                <td><Checkbox id="dps-condition" checked={roles.dpsCondition} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">CDPS</Checkbox></td>
                <td><Checkbox id="dps-condition-alacrity" checked={roles.dpsConditionAlacrity} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">CDPS Alac</Checkbox></td>
                <td><Checkbox id="dps-condition-quickness" checked={roles.dpsConditionQuickness} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">CDPS Quick</Checkbox></td>
            </tr>
            <tr>
                <th>Tank</th>
                <td><Checkbox id="dps-tank" checked={roles.dpsTank} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Tank DPS</Checkbox></td>
                <td><Checkbox id="dps-tank-alacrity" checked={roles.dpsTankAlacrity} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Tank DPS Alac</Checkbox></td>
                <td><Checkbox id="dps-tank-quickness" checked={roles.dpsTankQuickness} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Tank DPS Quick</Checkbox></td>
            </tr>
            <tr aria-hidden="true"><td colspan="5"><hr /></td></tr>
            <tr>
                <th colspan="2">Special Roles</th>
                <td colspan="3">
                    <ul>
                        <li><Checkbox id="hand-kite" checked={roles.handKite} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Hand Kite</Checkbox></li>
                        <li><Checkbox id="blood-scourge" checked={roles.bloodScourge} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Blood Scourge</Checkbox></li>
                        <li><Checkbox id="qadim-lamp" checked={roles.qadimLamp} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Qadim Lamp</Checkbox></li>
                        <li><Checkbox id="qadim-kite" checked={roles.qadimKite} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Qadim Kite</Checkbox></li>
                        <li><Checkbox id="pylon-kite" checked={roles.pylonKite} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Pylon Kite</Checkbox></li>
                        <li><Checkbox id="sh-pusher" checked={roles.shPusher} class="block pl-2 p-1 mr-2 rounded-md hover:bg-primary-500">Soulless Horror Pusher</Checkbox></li>
                    </ul>
                </td>
            </tr>
        </tbody>
    </table>

    {#if formState === false}
        <Button backgroundClass="bg-primary-700" spanClass="inline-block px-4 py-1">Submit</Button>
    {:else}
        <noscript>
            <Button backgroundClass="bg-primary-700" spanClass="inline-block px-4 py-1">Submit</Button>
        </noscript>
    {/if}
</form>
