"use client";

import React, { useMemo } from 'react'
import {
    Spinner,
    Table as FlowbiteTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeadCell,
    TableRow
} from 'flowbite-react';
import { FaBoxOpen } from 'react-icons/fa6';
import { useGetOpenPurchasesQuery } from '../store/api/expense.api';
import { useGetOpenSellsQuery } from '../store/api/open-sells.api';

const Table = () => {
    const { data: openPurchases = [], isLoading: isPurchaseLoading } = useGetOpenPurchasesQuery();
    const { data: openSells = [], isLoading: isSellsLoading } = useGetOpenSellsQuery();

    const totalExpense = useMemo(() => {
        if (!openPurchases || openPurchases.length <= 0) return null;

        const totalPurchase = openPurchases.reduce(
            (sum, p) => sum + (p.quantity ?? 0) * (p.unitPrice ?? 0),
            0
        );

        return totalPurchase;
    }, [openPurchases]);

    const totalIncome = useMemo(() => {
        if (!openSells || openSells.length <= 0) return null;

        const totalSells = openSells.reduce(
            (sum, s) => {
                const itemPrice = s.itemId && s.itemId.price ? s.itemId.price : 0;
                const itemFreq = s.totalFreq ? s.totalFreq : 0;
                return sum + itemPrice * itemFreq;
            },
            0
        );

        return totalSells;
    }, [openSells]);

    if (!openPurchases || openPurchases.length <= 0 || !openSells || openSells.length <= 0) {
        return (
            <div className='flex flex-col justify-center items-center p-8'>
                <span className='text-6xl text-gray-400'><FaBoxOpen /> </span>
                <span className='text-xl mt-2'>No expense/income found</span>
            </div>
        );
    }

    if (isPurchaseLoading || isSellsLoading) {
        return <div className='flex justify-center'><Spinner size="lg" className='mx-auto my-8' /></div>
    }

    return (
        <FlowbiteTable striped hoverable className='min-w-full'>
            <TableHead>
                <TableRow>
                    <TableHeadCell>
                        Name
                    </TableHeadCell>
                    <TableHeadCell>
                        Total
                    </TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>
                        Total Expense
                    </TableCell>
                    <TableCell>
                        {(totalExpense || 0).toFixed(2)}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        Total Income
                    </TableCell>
                    <TableCell>
                        {(totalIncome || 0).toFixed(2)}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        Net Total
                    </TableCell>
                    <TableCell>
                        {((totalIncome && totalExpense) ? (totalIncome - totalExpense) : 0).toFixed(2)}
                    </TableCell>
                </TableRow>
            </TableBody>
        </FlowbiteTable>
    )
}

export default Table