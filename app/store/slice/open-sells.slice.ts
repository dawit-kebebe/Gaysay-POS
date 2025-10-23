import { OpenSells } from "@/app/common/types/sells";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OpenSellsState } from "../../common/types/sells";

const openSellsSlice = createSlice({
    name: 'opensells',
    initialState: {
        openSells: [] as OpenSellsState[],
        unSyncChanges: false,
        openDeleteModal: false,
        openSellsModal: false,
        openCloseModal: false,
    },

    reducers: {
        setOpenSells: (state, action: PayloadAction<OpenSells[]>) => {
            state.openSells = action.payload.map(item => {
                return { ...item, sellsIncrease: 0, isSync: true };
            })
        },

        increaseFreqOnSells: (state, action: PayloadAction<{ openSellsId: string, frequency: number }>) => {
            const toBeUpdated = state.openSells.find((item) => {
                return item.id === action.payload.openSellsId;
            })

            if (toBeUpdated) {
                toBeUpdated.sellsIncrease += action.payload.frequency;
                toBeUpdated.isSync = (toBeUpdated.sellsIncrease + toBeUpdated.totalFreq! === toBeUpdated.totalFreq!)
                if ((toBeUpdated.sellsIncrease + toBeUpdated.totalFreq! === toBeUpdated.totalFreq!) === false) state.unSyncChanges = true;
            }
        },

        toggleSync: (state, action: PayloadAction<{ openSellsId: string, toggle?: boolean }>) => {
            const toBeUpdated = state.openSells.find((item) => {
                return item.id === action.payload.openSellsId;
            })

            if (toBeUpdated) {
                toBeUpdated.isSync! = (action.payload.toggle !== undefined) ? action.payload.toggle : !toBeUpdated.isSync;
                if (toBeUpdated.isSync === false) state.unSyncChanges = true;
            }
        },

        toggleUnSync: (state, action: PayloadAction<{ toggle?: boolean }>) => {
            state.unSyncChanges = (action.payload.toggle !== undefined) ? action.payload.toggle : !state.unSyncChanges;
        },

        toggleOpenDeleteModal: (state) => {
            state.openDeleteModal = !state.openDeleteModal;
        },

        toggleOpenCloseModal: (state) => {
            state.openCloseModal = !state.openCloseModal;
        },

        toggleOpenSellsModal: (state) => {
            state.openSellsModal = !state.openSellsModal;
        },
    }
});

export const { setOpenSells, increaseFreqOnSells, toggleSync, toggleUnSync, toggleOpenDeleteModal, toggleOpenSellsModal, toggleOpenCloseModal } /* setSelectedSells, addSelectedSells, removeSelectedSells, clearselectedSells, toggleOpenPreviewModal, toggleOnlyPreview, toggleOpenDeleteModal } */ = openSellsSlice.actions

export default openSellsSlice.reducer