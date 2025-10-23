import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './base.api';
import { PurchaseItem } from '@/app/common/types/purchase';

export const expenseApi = createApi({
    reducerPath: 'expenseApi',
    baseQuery,
    tagTypes: ['Expense'],
    endpoints: (builder) => ({
        getOpenPurchases: builder.query<PurchaseItem[], void>({
            query: () => ({ url: '/api/expense/open', method: 'GET' }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((p) => ({ type: 'Expense' as const, id: p.id })),
                        { type: 'Expense' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Expense' as const, id: 'LIST' }],
        }),

        getPurchaseById: builder.query<PurchaseItem, { id: string }>({
            query: ({ id }) => ({ url: `/api/expense/${id}`, method: 'GET' }),
            providesTags: (_result, _err, { id }) => [{ type: 'Expense' as const, id }],
        }),

        createPurchase: builder.mutation<PurchaseItem, Omit<PurchaseItem, 'id'>>({
            query: (body) => ({ url: '/api/expense/open', method: 'POST', body }),
            invalidatesTags: [{ type: 'Expense', id: 'LIST' }],
        }),

        updatePurchase: builder.mutation<PurchaseItem, PurchaseItem>({
            query: ({ id, ...patch }) => ({ url: `/api/expense/${id}`, method: 'PUT', body: patch }),
            invalidatesTags: (_result, _err, { id }) => [{ type: 'Expense', id }],
        }),

        deletePurchase: builder.mutation<{ message: string }, { id: string }>({
            query: ({ id }) => ({ url: `/api/expense/${id}`, method: 'DELETE' }),
            invalidatesTags: (_result, _err, { id }) => [{ type: 'Expense', id }, { type: 'Expense', id: 'LIST' }],
        }),

        closePurchase: builder.mutation<{ message: string; data: PurchaseItem }, { id: string }>({
            query: ({ id }) => ({ url: '/api/expense/close', method: 'POST', body: { id } }),
            invalidatesTags: (_result, _err, { id }) => [{ type: 'Expense', id }, { type: 'Expense', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetOpenPurchasesQuery,
    useGetPurchaseByIdQuery,
    useCreatePurchaseMutation,
    useUpdatePurchaseMutation,
    useDeletePurchaseMutation,
    useClosePurchaseMutation,
} = expenseApi;
