import { Menu } from "@/app/common/types/menu";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const menuSlice = createSlice({
    name: 'menu',
    initialState: {
        menu: [] as Menu[],
        selectedMenu: [] as Menu[],
        previewModal: {
            open: false,
            previewOnly: true,
        },
        openDeleteModal: false,
        openCreateModal: false,
    },

    reducers: {
        setMenu: (state, action: PayloadAction<Menu[]>) => {
            state.menu = action.payload
        },

        setSelectedMenu: (state, action: PayloadAction<Menu[]>) => {
            state.menu = action.payload
        },

        addSelectedMenu: (state, action: PayloadAction<Menu>) => {
            const exists = state.selectedMenu.some(u => u.id === action.payload.id);
            if (!exists) {
                state.selectedMenu.push(action.payload);
            }
        },

        removeSelectedMenu: (state, action: PayloadAction<string>) => {
            state.selectedMenu = state.selectedMenu.filter(u => u.id !== action.payload);
        },

        clearselectedMenu: (state) => {
            state.selectedMenu = [];
        },

        toggleOpenPreviewModal: (state, action: PayloadAction<boolean | undefined>) => {
            if (action.payload !== undefined) {
                state.previewModal.open = action.payload;
                return;
            }
            state.previewModal.open = !state.previewModal.open;
        },

        toggleOnlyPreview: (state, action: PayloadAction<boolean | undefined>) => {
            if (action.payload !== undefined) {
                state.previewModal.previewOnly = action.payload;
                return;
            }
            state.previewModal.previewOnly = !state.previewModal.previewOnly;
        },

        toggleOpenDeleteModal: (state) => {
            state.openDeleteModal = !state.openDeleteModal;
        },

        toggleOpenCreateModal: (state) => {
            state.openCreateModal = !state.openCreateModal;
        },
    }
});

export const { setMenu, setSelectedMenu, addSelectedMenu, removeSelectedMenu, clearselectedMenu, toggleOpenPreviewModal, toggleOnlyPreview, toggleOpenCreateModal, toggleOpenDeleteModal } = menuSlice.actions

export default menuSlice.reducer