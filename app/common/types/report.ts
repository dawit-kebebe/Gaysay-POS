import { PurchaseItem } from "./purchase";
import { OpenSells } from "./sells";

const ReportFilters = {
    TODAY: 'Today',
    LAST_WEEK: 'Last 7 days',
    LAST_MONTH: 'Last 30 days',
    LAST_YEAR: 'Last 365 days',
} as const;

type ReportFiltersType = typeof ReportFilters[keyof typeof ReportFilters];

interface ReportResponse {
    filter: ReportFiltersType,
    startDate: string,
    endDate: string,
    data: {
        expense: {
            totalExpenseItems: number,
            totalAmount: number,
            expenses: PurchaseItem[]
        },
        income: {
            totalIncomeItems: number,
            totalAmount: number,
            incomes: OpenSells[]
        }
    }
}


export { ReportFilters };
export type { ReportFiltersType, ReportResponse };
