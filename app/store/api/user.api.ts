// user.api.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './base.api'; // Assuming base.api.ts exists and exports baseQuery
import { CreateUserPayload, UpdatePasswordPayload, UpdateUserPayload, User } from '@/app/common/types/user';



export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery,
    tagTypes: ['User'],

    endpoints: (builder) => ({
        // 1. GET (Read all)
        getUsers: builder.query<User[], void>({
            query: () => ({
                url: '/api/users',
                method: 'GET',
            }),
            providesTags: ['User'],
        }),

        // 2. POST (Create)
        createUser: builder.mutation<User, CreateUserPayload>({
            query: (newUser) => ({
                url: '/api/users',
                method: 'POST',
                body: newUser,
            }),
            invalidatesTags: ['User'],
        }),

        // 3. PUT (Update details)
        updateUser: builder.mutation<User, UpdateUserPayload>({
            query: ({ id, ...patch }) => ({
                url: `/api/users/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
        }),

        // 4. PUT (Update password - separate endpoint often)
        updateUserPassword: builder.mutation<void, UpdatePasswordPayload>({
            query: ({ id, newPassword }) => ({
                url: `/api/users/${id}/password`, // Assuming a specific password update endpoint
                method: 'PUT',
                body: { newPassword },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }], // Optionally invalidate to force data refresh
        }),

        // 5. DELETE (Delete)
        deleteUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'User', id }],
        }),
    }),
});

// Export hooks
export const {
    useGetUsersQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useUpdateUserPasswordMutation,
    useDeleteUserMutation,
} = userApi;