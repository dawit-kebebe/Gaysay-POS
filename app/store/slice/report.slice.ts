import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReportFilters, ReportFiltersType, ReportResponse } from '@/app/common/types/report';

const reportSlice = createSlice({
    name: 'report',
    initialState: {
        today: null as ReportResponse | null,
        lastWeek: null as ReportResponse | null,
        lastMonth: null as ReportResponse | null,
        lastYear: null as ReportResponse | null,

        reportFilter: ReportFilters.TODAY as ReportFiltersType,
        reportType: 'Income' as 'Income' | 'Expense',
    },
    reducers: {
        setToday: (state, action: PayloadAction<ReportResponse | null>) => {
            state.today = action.payload;
        },
        clearToday: (state) => {
            state.today = null;
        },

        setLastWeek: (state, action: PayloadAction<ReportResponse | null>) => {
            state.lastWeek = action.payload;
        },
        clearLastWeek: (state) => {
            state.lastWeek = null;
        },

        setLastMonth: (state, action: PayloadAction<ReportResponse | null>) => {
            state.lastMonth = action.payload;
        },
        clearLastMonth: (state) => {
            state.lastMonth = null;
        },

        setLastYear: (state, action: PayloadAction<ReportResponse | null>) => {
            state.lastYear = action.payload;
        },
        clearLastYear: (state) => {
            state.lastYear = null;
        },

        setReportFilter: (state, action: PayloadAction<ReportFiltersType>) => {
            state.reportFilter = action.payload;
        },

        setReportType: (state, action: PayloadAction<'Income' | 'Expense'>) => {
            state.reportType = action.payload;
        }
    }
});

export const {
    setToday,
    clearToday,
    setLastWeek,
    clearLastWeek,
    setLastMonth,
    clearLastMonth,
    setLastYear,
    clearLastYear,

    setReportFilter,
    setReportType
} = reportSlice.actions;

export default reportSlice.reducer;
