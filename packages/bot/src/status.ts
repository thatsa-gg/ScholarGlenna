import { sleep, minutes, range, random, randomFrom } from '@glenna/util'
import type { ClientUser } from 'discord.js'
import { VERSION } from '@glenna/common'
const statuses = [
    `Now updated to version ${VERSION}!`,
    `Why not browse my inventory while you're here?`,
    `Assembling magnetite bombs.`,
    `Drinking prison water.`,
    `Sketching Eye of Janthir.`,
    `Missing blues.`,
    `Regretting vacation choices.`,
    `Signing waivers.`,
    `Taking a really weird tour.`,
    `Scolding djinn.`,
    `Knowing everything.`,
];
export async function updateStatus(user: ClientUser){
    do {
        const next = randomFrom(statuses)
        user.setActivity(next)
        await sleep(minutes(random(range(4, 7, 'Inclusive'))))
    } while(true)
}
