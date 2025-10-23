import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './base.api';

export interface LoginResponse {
    message: string
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery,
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, { username: string; password: string }>({
            query: (credentials) => ({
                url: '/api/login',
                method: 'POST',
                body: credentials,
            })
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: '/api/logout',
                method: 'POST',
            }),
        }),
    }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;