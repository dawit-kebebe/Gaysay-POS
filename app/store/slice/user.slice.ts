import { User } from "@/app/common/types/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: {
        users: [] as User[],
        selectedUser: [] as User[],
        previewModal: {
            open: false,
            previewOnly: true,
        },
        openDeleteModal: false,
        openCreateModal: false,
    },

    reducers: {
        // Reducer to set the list of all users (e.g., after fetching)
        setUsers: (state, action: PayloadAction<User[]>) => {
            state.users = action.payload
        },

        // Reducer to add a user to the selection array
        addSelectedUser: (state, action: PayloadAction<User>) => {
            const exists = state.selectedUser.some(u => u.id === action.payload.id);
            if (!exists) {
                state.selectedUser.push(action.payload);
            }
        },

        // Reducer to remove a user from the selection array by ID
        removeSelectedUser: (state, action: PayloadAction<string>) => {
            state.selectedUser = state.selectedUser.filter(u => u.id !== action.payload);
        },

        // Reducer to clear all selected users
        clearselectedUser: (state) => {
            state.selectedUser = [];
        },

        // Toggle visibility of the Preview/Update modal
        toggleOpenPreviewModal: (state, action: PayloadAction<boolean | undefined>) => {
            if (action.payload !== undefined) {
                state.previewModal.open = action.payload;
                return;
            }
            state.previewModal.open = !state.previewModal.open;
        },

        // Toggle between Preview-Only and Edit modes in PreviewModal
        toggleOnlyPreview: (state, action: PayloadAction<boolean | undefined>) => {
            if (action.payload !== undefined) {
                state.previewModal.previewOnly = action.payload;
                return;
            }
            state.previewModal.previewOnly = !state.previewModal.previewOnly;
        },

        // Toggle visibility of the Delete modal
        toggleOpenDeleteModal: (state) => {
            state.openDeleteModal = !state.openDeleteModal;
        },

        // Toggle visibility of the Create modal
        toggleOpenCreateModal: (state) => {
            state.openCreateModal = !state.openCreateModal;
        },
    }
});

export const {
    setUsers,
    addSelectedUser,
    removeSelectedUser,
    clearselectedUser,
    toggleOpenPreviewModal,
    toggleOnlyPreview,
    toggleOpenCreateModal,
    toggleOpenDeleteModal,
} = userSlice.actions

export default userSlice.reducer