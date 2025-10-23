interface PurchaseItem {
    id: string;
    name: string;
    description?: string;
    unitPrice: number;
    quantity: number;
    isClosed?: boolean;

    createdAt?: string,
    updatedAt?: string,
}

type CreatePurchaseItemPayload = Omit<PurchaseItem, 'id'>;

type UpdatePurchaseItemPayload = PurchaseItem & { id: string };

export type { CreatePurchaseItemPayload, PurchaseItem, UpdatePurchaseItemPayload };
