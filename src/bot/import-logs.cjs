void async function(){
    const { trpc } = await import('@glenna/api')
    const { readFileSync } = require('fs')
    const data = JSON.parse(readFileSync('../../temp2.json'))
    const { Database } = await import('@glenna/prisma')
    const db = Database.create()
    const { slugify } = await import('@glenna/util')

    const dbGuild = await db.guild.findFirstOrThrow({
        select: {
            id: true,
            divisions: {
                where: { primary: true },
                select: {
                    id: true
                }
            }
        }
    })
    const division = dbGuild.divisions[0]
    if(!division)
        throw `import-logs: Could not find primary division for guild ${dbGuild.id}`
    const teams = new Map(await db.team.findMany({
        where: { guild: { id: dbGuild.id } },
        select: {
            name: true,
            snowflake: true
        }
    }).then(results => results.map(({ name, snowflake }) => [name.toLowerCase(), snowflake])));

    for(let idx=0;idx<data.length;idx+=1){
        const row = data[idx]
        try {
            const teamNameIdx = row.team.toLowerCase();
            if (!teams.has(teamNameIdx)) {
                console.log(`import-logs: creating unknown team "${row.team}"`);
                const team = await db.team.create({
                    data: {
                        name: row.team,
                        alias: slugify(row.team),
                        guild: { connect: { id: dbGuild.id } },
                        division: { connect: { id: division.id } }
                    },
                    select: {
                        snowflake: true
                    }
                });
                teams.set(teamNameIdx, team.snowflake);
            }
            const team = teams.get(teamNameIdx);
            const result = await trpc.log.submit({
                submittedAt: new Date(row.time),
                team,
                logs: [
                    row.log
                ]
            })
            console.log(`Item ${idx}: ${JSON.stringify(result)}`)
        } catch(e) {
            console.error(`Item ${idx}: ${e}`)
        }
    }
}()
