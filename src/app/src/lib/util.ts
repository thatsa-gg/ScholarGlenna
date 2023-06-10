import type { TeamRegion } from '@glenna/prisma'
export function teamRegionToBadgeName(region: TeamRegion): string {
    switch(region){
        case 'NorthAmerica': return 'NA'
        case 'Europe': return 'EU'
        case 'AustraliaNA': return 'OCX'
        case 'AustraliaEU': return 'OCX(EU)'
    }
}
