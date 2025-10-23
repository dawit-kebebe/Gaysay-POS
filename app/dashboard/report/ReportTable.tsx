"use client";

import { PurchaseItem } from '@/app/common/types/purchase';
import { OpenSells } from '@/app/common/types/sells';
import { formatEthDate } from '@/app/common/util/date-conv';
import { useAppSelector } from '@/app/store';
import { useGetReportQuery } from '@/app/store/api/report.api';
import {
    Table as FlowbiteTable,
    Spinner,
    TableBody,
    TableCell,
    TableHead,
    TableHeadCell,
    TableRow
} from 'flowbite-react';
import { memo, useMemo } from 'react';
import { FaBoxOpen } from 'react-icons/fa6';

// Helper to format currency
const formatCurrency = (amount: number | undefined): string => {
    return amount ? `${amount.toFixed(2)}` : '0.00';
};


const ReportRow = memo(({ item, dataType }: { item: PurchaseItem | OpenSells; dataType: 'Income' | 'Expense' }) => {
    if (dataType === 'Expense') {
        const expenseItem = item as PurchaseItem;
        const name = expenseItem.name || 'N/A';
        const date = expenseItem.createdAt ? formatEthDate(expenseItem.createdAt) : 'N/A';
        const price = expenseItem.unitPrice || 0;
        const quantity = expenseItem.quantity || 0;
        const total = price * quantity;

        return (
            <TableRow key={expenseItem.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <TableCell className="font-medium text-gray-900 dark:text-white">{name}</TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-white">{date}</TableCell>
                <TableCell>{formatCurrency(price)}</TableCell>
                <TableCell>{quantity}</TableCell>
                <TableCell>{formatCurrency(total)}</TableCell>
            </TableRow>
        );
    }

    if (dataType === 'Income') {
        const incomeItem = item as OpenSells;
        // OpenSells.itemId is a Menu object per types; display its name
        const name = (incomeItem.itemId && incomeItem.itemId.name) || 'N/A';
        const date = incomeItem.createdAt ? formatEthDate(incomeItem.createdAt) : 'N/A';
        const price = (incomeItem.itemId && incomeItem.itemId.price) || 0;
        const quantity = incomeItem.totalFreq || 0;
        const total = (incomeItem.totalFreq && incomeItem.itemId.price && incomeItem.totalFreq * incomeItem.itemId.price) || 0;

        return (
            <TableRow key={incomeItem.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <TableCell className="font-medium text-gray-900 dark:text-white">{name}</TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-white">{date}</TableCell>
                <TableCell>{formatCurrency(price)}</TableCell>
                <TableCell>{quantity}</TableCell>
                <TableCell>{formatCurrency(total)}</TableCell>
            </TableRow>
        );
    }

    return null;
});
ReportRow.displayName = 'ReportRow';

// Main Report Table Component
export const ReportTable = () => {
    const filter = useAppSelector((state) => state.report.reportFilter);
    const reportType = useAppSelector((state) => state.report.reportType);

    const { data: report, isLoading, isError } = useGetReportQuery({ filter });


    const { dataList, totalAmount, isLoaded } = useMemo(() => {
        if (!report) return { dataList: [], totalAmount: 0, isLoaded: false };

        let dataSection;
        if (reportType === 'Income') {
            dataSection = report.data.income;
            return {
                dataList: dataSection.incomes,
                totalAmount: dataSection.totalAmount ?? 0,
                isLoaded: true,
            };
        } else if (reportType === 'Expense') {
            dataSection = report.data.expense;
            return {
                dataList: dataSection.expenses,
                totalAmount: dataSection.totalAmount ?? 0,
                isLoaded: true,
            };
        } else {
            return { dataList: [], totalAmount: 0, isLoaded: false };
        }

    }, [report, reportType]);

    // Conditional rendering for loading and empty states
    if (isLoading || !isLoaded) return <div className='flex justify-center'><Spinner size="lg" className='mx-auto my-8' /></div>;
    if (isError) return <div className="p-4 text-red-500">Error: Failed to load report.</div>;

    if (dataList.length === 0) {
        return (
            <div className='flex flex-col justify-center items-center p-8'>
                <span className='text-6xl text-gray-400'><FaBoxOpen /> </span>
                <span className='text-xl mt-2'>No {reportType} Found for {filter}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full mx-auto p-4">
            <div className="overflow-x-auto w-full rounded-lg shadow-lg">
                <FlowbiteTable striped hoverable className='min-w-full'>
                    <TableHead className='bg-gray-100 dark:bg-gray-700'>
                        <TableRow>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Date</TableHeadCell>
                            <TableHeadCell>Unit Price</TableHeadCell>
                            <TableHeadCell>Quantity</TableHeadCell>
                            <TableHeadCell>Total</TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className="divide-y">
                        {dataList.map((item) => (
                            <ReportRow key={item.id ?? Math.random().toString(36).slice(2, 9)} item={item} dataType={reportType} />
                        ))}
                    </TableBody>
                </FlowbiteTable>
            </div>

            {/* Total Amount displayed at the bottom of the table outside of the table, as requested */}
            <div className="flex justify-end p-4 bg-white dark:bg-gray-800 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
                <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
                    Total: <u className='decoration-1 decoration-wavy'>{formatCurrency(totalAmount)}</u>
                </span>
            </div>
        </div>
    );
}

export default ReportTable;
