import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './base.api';
import { CreateUserPayload, UpdatePasswordPayload, UpdateUserPayload, User } from '@/app/common/types/user';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery,
    tagTypes: ['User'],

    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => ({
                url: '/api/users',
                method: 'GET',
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'User' as const, id })),
                        { type: 'User', id: 'LIST' },
                    ]
                    : [{ type: 'User', id: 'LIST' }],
        }),

        getUser: builder.query<User, string>({
            query: (id) => ({
                url: `/api/users/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),

        createUser: builder.mutation<User, CreateUserPayload>({
            query: (newUser) => ({
                url: '/api/users',
                method: 'POST',
                body: newUser,
            }),
            invalidatesTags: [{ type: 'User', id: 'LIST' }],
        }),

        updateUser: builder.mutation<User, UpdateUserPayload>({
            query: ({ id, ...patch }) => ({
                url: `/api/users/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
        }),

        updateUserPassword: builder.mutation<void, UpdatePasswordPayload>({
            query: ({ id, newPassword }) => ({
                url: `/api/users/${id}/password`,
                method: 'PUT',
                body: { newPassword },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
        }),

        deleteUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useUpdateUserPasswordMutation,
    useDeleteUserMutation,
} = userApi;