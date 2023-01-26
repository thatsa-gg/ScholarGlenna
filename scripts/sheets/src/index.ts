import { DOUBLE } from './double'
function TRIPLE(a: number){
    return a * 3
}

(global as any).DOUBLE = DOUBLE;
(global as any).TRIPLE = TRIPLE;
