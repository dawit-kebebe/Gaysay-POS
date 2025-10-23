import { CreateSellsPayload, OpenSells, Sells } from '@/app/common/types/sells';
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './base.api'; // Assuming base.api.ts exists and exports baseQuery

export const openSellsApi = createApi({
    reducerPath: 'openSellsApi',
    baseQuery,
    tagTypes: ['OpenSells'],

    endpoints: (builder) => ({
        getOpenSells: builder.query<OpenSells[], void>({
            query: () => ({
                url: '/api/sells/open',
                method: 'GET',
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'OpenSells' as const, id })),
                        { type: 'OpenSells' as const, id: 'LIST' },
                    ]
                    : [{ type: 'OpenSells' as const, id: 'LIST' }],
        }),

        getOpenSellsById: builder.query<OpenSells, { id: string }>({
            query: ({ id }) => ({
                url: `/api/sells/open/${id}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, { id }) => [{ type: 'OpenSells' as const, id }],
        }),

        openSells: builder.mutation<Sells, CreateSellsPayload>({
            query: (newSells) => ({
                url: '/api/sells/open',
                method: 'POST',
                body: newSells,
            }),
            invalidatesTags: [{ type: 'OpenSells', id: 'LIST' }],
        }),

        closeSells: builder.mutation<{ message: string }, { id: string }>({
            query: (newSells) => ({
                url: '/api/sells/close',
                method: 'POST',
                body: newSells,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'OpenSells', id },
                { type: 'OpenSells', id: 'LIST' },
            ],
        }),

        syncOpenSells: builder.mutation<{ message: string; data: OpenSells }, { id: string; frequency: number }>({
            query: (newSells) => ({
                url: '/api/sells/sync',
                method: 'POST',
                body: newSells,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'OpenSells', id },
                { type: 'OpenSells', id: 'LIST' },
            ],
        }),

        deleteOpenSells: builder.mutation<{ message: string }, { id: string }>({
            query: ({ id }) => ({
                url: `/api/sells/open/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'OpenSells', id },
                { type: 'OpenSells', id: 'LIST' },
            ],
        }),
    }),
});


// Export hooks for use in functional components
export const {
    useGetOpenSellsQuery,
    useGetOpenSellsByIdQuery,
    useSyncOpenSellsMutation,
    useCloseSellsMutation,
    useOpenSellsMutation,
    useDeleteOpenSellsMutation,
} = openSellsApi;