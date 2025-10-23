import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './base.api';
import { ReportResponse, ReportFiltersType } from '@/app/common/types/report';

export const reportApi = createApi({
    reducerPath: 'reportApi',
    baseQuery,
    tagTypes: ['Report'],
    endpoints: (builder) => ({
        getReport: builder.query<ReportResponse, { filter: ReportFiltersType } | void>({
            query: (arg) => {
                const filter = arg?.filter ?? '';
                return { url: `/api/report${filter ? `?filter=${encodeURIComponent(filter)}` : ''}`, method: 'GET' };
            },
            providesTags: [{ type: 'Report', id: 'LIST' }],
        }),
    }),
});

export const { useGetReportQuery } = reportApi;

export default reportApi;
