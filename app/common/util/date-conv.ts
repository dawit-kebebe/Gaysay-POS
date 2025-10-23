import Kenat from "kenat";

export function formatEthDate(date: string) {
    const dateEth = new Kenat(new Date(date));
    const ethDate = dateEth.getEthiopian();
    return `${ethDate.day}/${ethDate.month}/${ethDate.year} E.C.`;
}

export function formatEthTime(date: string) {
    const dateEth = new Kenat(new Date(date));
    const ethTime = dateEth.time;
    return `${String(ethTime.hour).padStart(2, '0')}:${String(ethTime.minute).padStart(2, '0')}`;
}