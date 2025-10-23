import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit'

export type ToastType = 'success' | 'failure' | 'warning'

export interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastState {
    toasts: Toast[]
}

const initialState: ToastState = {
    toasts: []
}

export const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        addToast: {
            reducer(state, action: PayloadAction<Toast>) {
                state.toasts.push(action.payload)
            },
            prepare(message: string, type: ToastType) {
                return {
                    payload: {
                        id: nanoid(),
                        message,
                        type
                    } as Toast
                }
            }
        },
        removeToast(state, action: PayloadAction<string>) {
            state.toasts = state.toasts.filter(t => t.id !== action.payload)
        }
    }
})

export const { addToast, removeToast } = toastSlice.actions

export default toastSlice.reducer