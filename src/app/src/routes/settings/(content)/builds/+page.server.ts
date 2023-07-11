import type { Actions, PageServerLoad } from './$types'
import { database } from '$lib/server'
import { error, fail } from '@sveltejs/kit'
import { zfd } from 'zod-form-data'

export const load = (async ({ locals }) => {
    if(!locals.session)
        throw error(403)
    const roles = await database.playerRole.upsert({
        where: { profileId: locals.session.profile.id },
        create: { profile: { connect: { id: locals.session.profile.id }}},
        update: {},
        select: {
            heal: true,
            healAlacrity: true,
            healQuickness: true,

            healTank: true,
            healTankAlacrity: true,
            healTankQuickness: true,

            dpsPower: true,
            dpsPowerAlacrity: true,
            dpsPowerQuickness: true,

            dpsCondition: true,
            dpsConditionAlacrity: true,
            dpsConditionQuickness: true,

            dpsTank: true,
            dpsTankAlacrity: true,
            dpsTankQuickness: true,

            handKite: true,
            bloodScourge: true,
            qadimLamp: true,
            qadimKite: true,
            pylonKite: true,
            shPusher: true,
        }
    })

    return {
        roles: {
            heal: roles.heal,
            healAlacrity: roles.healAlacrity,
            healQuickness: roles.healQuickness,

            healTank: roles.healTank,
            healTankAlacrity: roles.healTankAlacrity,
            healTankQuickness: roles.healTankQuickness,

            dpsPower: roles.dpsPower,
            dpsPowerAlacrity: roles.dpsPowerAlacrity,
            dpsPowerQuickness: roles.dpsPowerQuickness,

            dpsCondition: roles.dpsCondition,
            dpsConditionAlacrity: roles.dpsConditionAlacrity,
            dpsConditionQuickness: roles.dpsConditionQuickness,

            dpsTank: roles.dpsTank,
            dpsTankAlacrity: roles.dpsTankAlacrity,
            dpsTankQuickness: roles.dpsTankQuickness,

            handKite: roles.handKite,
            bloodScourge: roles.bloodScourge,
            qadimLamp: roles.qadimLamp,
            qadimKite: roles.qadimKite,
            pylonKite: roles.pylonKite,
            shPusher: roles.shPusher,
        }
    }
}) satisfies PageServerLoad

export const actions: Actions = {
    async default({ request, locals }){
        if(!locals.session)
            throw error(403)

        const data = zfd.formData({
            'heal': zfd.checkbox(),
            'heal-alacrity': zfd.checkbox(),
            'heal-quickness': zfd.checkbox(),

            'heal-tank': zfd.checkbox(),
            'heal-tank-alacrity': zfd.checkbox(),
            'heal-tank-quickness': zfd.checkbox(),

            'dps-power': zfd.checkbox(),
            'dps-power-alacrity': zfd.checkbox(),
            'dps-power-quickness': zfd.checkbox(),

            'dps-condition': zfd.checkbox(),
            'dps-condition-alacrity': zfd.checkbox(),
            'dps-condition-quickness': zfd.checkbox(),

            'dps-tank': zfd.checkbox(),
            'dps-tank-alacrity': zfd.checkbox(),
            'dps-tank-quickness': zfd.checkbox(),

            'hand-kite': zfd.checkbox(),
            'blood-scourge': zfd.checkbox(),
            'qadim-lamp': zfd.checkbox(),
            'qadim-kite': zfd.checkbox(),
            'pylon-kite': zfd.checkbox(),
            'sh-pusher': zfd.checkbox(),
        }).safeParse(await request.formData())

        if(!data.success)
            return fail(400, data.error.formErrors)

        const updated = await database.playerRole.update({
            where: { profileId: locals.session.profile.id },
            data: {
                heal: data.data['heal'],
                healAlacrity: data.data['heal-alacrity'],
                healQuickness: data.data['heal-quickness'],

                healTank: data.data['heal-tank'],
                healTankAlacrity: data.data['heal-tank-alacrity'],
                healTankQuickness: data.data['heal-quickness'],

                dpsPower: data.data['dps-power'],
                dpsPowerAlacrity: data.data['dps-power-alacrity'],
                dpsPowerQuickness: data.data['dps-power-quickness'],

                dpsCondition: data.data['dps-condition'],
                dpsConditionAlacrity: data.data['dps-condition-alacrity'],
                dpsConditionQuickness: data.data['dps-condition-quickness'],

                dpsTank: data.data['dps-tank'],
                dpsTankAlacrity: data.data['dps-tank-alacrity'],
                dpsTankQuickness: data.data['dps-tank-quickness'],

                handKite: data.data['hand-kite'],
                bloodScourge: data.data['blood-scourge'],
                qadimLamp: data.data['qadim-lamp'],
                qadimKite: data.data['qadim-kite'],
                pylonKite: data.data['pylon-kite'],
                shPusher: data.data['sh-pusher'],
            }
        })

        return {
            success: true,
            roles: {
                heal: updated.heal,
                healAlacrity: updated.healAlacrity,
                healQuickness: updated.healQuickness,

                healTank: updated.healTank,
                healTankAlacrity: updated.healTankAlacrity,
                healTankQuickness: updated.healTankQuickness,

                dpsPower: updated.dpsPower,
                dpsPowerAlacrity: updated.dpsPowerAlacrity,
                dpsPowerQuickness: updated.dpsPowerQuickness,

                dpsCondition: updated.dpsCondition,
                dpsConditionAlacrity: updated.dpsConditionAlacrity,
                dpsConditionQuickness: updated.dpsConditionQuickness,

                dpsTank: updated.dpsTank,
                dpsTankAlacrity: updated.dpsTankAlacrity,
                dpsTankQuickness: updated.dpsTankQuickness,

                handKite: updated.handKite,
                bloodScourge: updated.bloodScourge,
                qadimLamp: updated.qadimLamp,
                qadimKite: updated.qadimKite,
                pylonKite: updated.pylonKite,
                shPusher: updated.shPusher,
            }
        }
    }
}
