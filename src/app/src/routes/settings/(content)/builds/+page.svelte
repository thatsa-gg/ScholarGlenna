<script lang="ts">
    import Checkbox from "$lib/components/form/Checkbox.svelte"
</script>
<form>
    <h1 class="text-3xl">Builds</h1>
    <hr />

    <table>
        <thead>
            <tr>
                <th colspan="2"></th>
                <th>Pure</th>
                <th>Alacrity</th>
                <th>Quickness</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th rowspan="2">Heal</th>
                <th>Pure</th>
                <td><Checkbox id="heal-pure">Pure</Checkbox></td>
                <td><Checkbox id="heal-alacrity">Alacrity</Checkbox></td>
                <td><Checkbox id="heal-quickness">Quickness</Checkbox></td>
            </tr>
            <tr>
                <th>Tank</th>
                <td><Checkbox id="heal-tank-pure">Pure</Checkbox></td>
                <td><Checkbox id="heal-tank-alacrity">Alacrity</Checkbox></td>
                <td><Checkbox id="heal-tank-quickness">Quickness</Checkbox></td>
            </tr>
            <tr aria-hidden="true"><td colspan="5"><hr /></td></tr>
            <tr>
                <th rowspan="3">DPS</th>
                <th>Power</th>
                <td><Checkbox id="dps-power-pure">Pure</Checkbox></td>
                <td><Checkbox id="dps-power-alacrity">Alacrity</Checkbox></td>
                <td><Checkbox id="dps-power-quickness">Quickness</Checkbox></td>
            </tr>
            <tr>
                <th>Condition</th>
                <td><Checkbox id="dps-condition-pure">Pure</Checkbox></td>
                <td><Checkbox id="dps-condition-alacrity">Alacrity</Checkbox></td>
                <td><Checkbox id="dps-condition-quickness">Quickness</Checkbox></td>
            </tr>
            <tr>
                <th>Tank</th>
                <td><Checkbox id="dps-tank-pure">Pure</Checkbox></td>
                <td><Checkbox id="dps-tank-alacrity">Alacrity</Checkbox></td>
                <td><Checkbox id="dps-tank-quickness">Quickness</Checkbox></td>
            </tr>
            <tr aria-hidden="true"><td colspan="5"><hr /></td></tr>
            <tr>
                <th colspan="2">Special Roles</th>
                <td colspan="3">
                    <ul>
                        <li><Checkbox id="hand-kite">Hand Kite</Checkbox></li>
                        <li><Checkbox id="blood-scourge">Blood Scourge</Checkbox></li>
                        <li><Checkbox id="qadim-lamp">Qadim Lamp</Checkbox></li>
                        <li><Checkbox id="qadim-kite">Qadim Kite</Checkbox></li>
                        <li><Checkbox id="pylon-kite">Pylon Kite</Checkbox></li>
                        <li><Checkbox id="sh-pusher">Soulless Horror Pusher</Checkbox></li>
                    </ul>
                </td>
            </tr>
        </tbody>
    </table>
</form>

<style lang="postcss">

</style>
