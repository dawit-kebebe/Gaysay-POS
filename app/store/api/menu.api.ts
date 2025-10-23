import { createApi, TagDescription } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './base.api';
import { type Menu } from '@/app/common/types/menu';

type CreateMenuPayload = Omit<Menu, 'id'> & { id?: string };

const providesList = (results: Menu[] | undefined): TagDescription<"Menu">[] => {
    return results
        ? [
            { type: 'Menu', id: 'LIST' },
            ...results.map((menu) => ({ type: 'Menu' as const, id: menu.id })),
        ]
        : [{ type: 'Menu', id: 'LIST' }];
};

export const menuApi = createApi({
    reducerPath: 'menuApi',
    baseQuery,
    tagTypes: ['Menu'],

    endpoints: (builder) => ({
        getMenus: builder.query<Menu[], void>({
            query: () => ({
                url: '/api/menu',
                method: 'GET',
            }),
            providesTags: (result) => providesList(result),
        }),

        createMenu: builder.mutation<Menu, CreateMenuPayload>({
            query: (newMenu) => ({
                url: '/api/menu',
                method: 'POST',
                body: newMenu,
            }),
            invalidatesTags: [{ type: 'Menu', id: 'LIST' }],
        }),

        updateMenu: builder.mutation<Menu, Menu>({
            query: ({ id, ...patch }) => ({
                url: `/api/menu/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Menu', id: 'LIST' },
                { type: 'Menu', id: id }
            ],
        }),

        deleteMenu: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/menu/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Menu', id: 'LIST' },
                { type: 'Menu', id }
            ],
        }),
    }),
});

export const {
    useGetMenusQuery,
    useCreateMenuMutation,
    useUpdateMenuMutation,
    useDeleteMenuMutation,
} = menuApi;