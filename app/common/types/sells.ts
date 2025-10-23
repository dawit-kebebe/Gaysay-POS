import { Menu } from "./menu";

interface Sells {
    id?: string;
    itemId: string;
    frequency: number,
    timestamp: Date;
}

type CreateSellsPayload = Omit<Sells, 'id'>;
type UpdateSellsPayload = Sells & { id: string };
type OpenSells = {
    id: string,
    itemId: Menu,
    isClosed: boolean;
    createdAt: string,
    updatedAt: string,
    unitsSold: Array<
        {
            frequency: number,
            timestamp: string,
        }
    >,

    totalFreq?: number;
    isSync?: boolean;
}

interface OpenSellsState extends OpenSells {
    sellsIncrease: number
}

export type { Sells, CreateSellsPayload, UpdateSellsPayload, OpenSells, OpenSellsState };