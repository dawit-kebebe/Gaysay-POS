import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PurchaseItem } from '@/app/common/types/purchase';

const expenseSlice = createSlice({
    name: 'expense',
    initialState: {
        purchases: [] as PurchaseItem[],
        selectedPurchases: [] as PurchaseItem[],
        openDeleteModal: false,
        openCreateModal: false,
        openPreviewModal: false,
        openClosePurchaseModal: false,
    },
    reducers: {
        setPurchases: (state, action: PayloadAction<PurchaseItem[]>) => {
            state.purchases = action.payload;
        },
        setSelectedPurchases: (state, action: PayloadAction<PurchaseItem[]>) => {
            state.selectedPurchases = action.payload;
        },
        addSelectedPurchase: (state, action: PayloadAction<PurchaseItem>) => {
            if (!state.selectedPurchases.some(p => p.id === action.payload.id)) state.selectedPurchases.push(action.payload);
        },
        removeSelectedPurchase: (state, action: PayloadAction<string>) => {
            state.selectedPurchases = state.selectedPurchases.filter(p => p.id !== action.payload);
        },
        clearSelectedPurchases: (state) => { state.selectedPurchases = []; },
        toggleOpenDeleteModal: (state) => { state.openDeleteModal = !state.openDeleteModal },
        toggleOpenCreateModal: (state) => { state.openCreateModal = !state.openCreateModal },
        toggleOpenPreviewModal: (state) => { state.openPreviewModal = !state.openPreviewModal },
        toggleOpenClosePurchaseModal: (state) => { state.openClosePurchaseModal = !state.openClosePurchaseModal },
    }
});
export const { setPurchases, setSelectedPurchases, addSelectedPurchase, removeSelectedPurchase, clearSelectedPurchases, toggleOpenDeleteModal, toggleOpenCreateModal, toggleOpenPreviewModal, toggleOpenClosePurchaseModal } = expenseSlice.actions;
export default expenseSlice.reducer;
