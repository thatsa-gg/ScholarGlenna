import type { TeamRegion } from '@glenna/prisma'
export function teamRegionToBadgeName(region: TeamRegion): string {
    switch(region){
        case 'NorthAmerica': return 'NA'
        case 'Europe': return 'EU'
        case 'AustraliaNA': return 'OCX'
        case 'AustraliaEU': return 'OCX(EU)'
    }
}

export function searchParamsAsObject(params: URLSearchParams): object {
    const target: any = {}
    for(const [ key, value ] of params.entries()){
        if(key in target){
            if(Array.isArray(typeof target[key]))
                target[key].push(value)
            else
                target[key] = [ target[key], value ]
        } else {
            target[key] = value
        }
    }
    return target
}
