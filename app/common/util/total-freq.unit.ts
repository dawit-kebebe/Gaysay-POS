export function totalFreq(unitsSold: Array<{ frequency: number, timestamp?: unknown }>) {
    let sum: number = 0;
    for (let i = 0; i < unitsSold.length; i++)
        sum += unitsSold[i].frequency
    return sum;
}